#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
VERSION_TYPE="patch"
DRY_RUN=false
SKIP_TESTS=false
SKIP_GIT=false

# Package directory
PACKAGE_DIR="packages/dao-action-builder"

usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -t, --type <type>    Version bump type: patch, minor, major, or specific version (default: patch)"
    echo "  -d, --dry-run        Perform a dry run without publishing"
    echo "  --skip-tests         Skip running tests"
    echo "  --skip-git           Skip git operations (tag, push)"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                   # Bump patch version and publish"
    echo "  $0 -t minor          # Bump minor version and publish"
    echo "  $0 -t major          # Bump major version and publish"
    echo "  $0 -t 1.2.3          # Set specific version and publish"
    echo "  $0 -d                # Dry run (no actual publish)"
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            VERSION_TYPE="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-git)
            SKIP_GIT=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Check if we're in the root directory
if [ ! -f "package.json" ] || [ ! -d "packages" ]; then
    log_error "Please run this script from the monorepo root directory"
    exit 1
fi

# Check for uncommitted changes
if [ "$SKIP_GIT" = false ]; then
    if ! git diff --quiet HEAD; then
        log_error "You have uncommitted changes. Please commit or stash them first."
        exit 1
    fi
fi

# Check npm login status
if ! npm whoami &> /dev/null; then
    log_error "You are not logged in to npm. Please run 'npm login' first."
    exit 1
fi

NPM_USER=$(npm whoami)
log_info "Logged in as: $NPM_USER"

# Get current version
cd "$PACKAGE_DIR"
CURRENT_VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME=$(node -p "require('./package.json').name")
cd - > /dev/null

log_info "Package: $PACKAGE_NAME"
log_info "Current version: $CURRENT_VERSION"

# Calculate new version
if [[ "$VERSION_TYPE" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    NEW_VERSION="$VERSION_TYPE"
else
    case $VERSION_TYPE in
        patch|minor|major)
            IFS='.' read -r -a VERSION_PARTS <<< "$CURRENT_VERSION"
            MAJOR="${VERSION_PARTS[0]}"
            MINOR="${VERSION_PARTS[1]}"
            PATCH="${VERSION_PARTS[2]}"

            case $VERSION_TYPE in
                patch)
                    PATCH=$((PATCH + 1))
                    ;;
                minor)
                    MINOR=$((MINOR + 1))
                    PATCH=0
                    ;;
                major)
                    MAJOR=$((MAJOR + 1))
                    MINOR=0
                    PATCH=0
                    ;;
            esac

            NEW_VERSION="$MAJOR.$MINOR.$PATCH"
            ;;
        *)
            log_error "Invalid version type: $VERSION_TYPE"
            exit 1
            ;;
    esac
fi

log_info "New version: $NEW_VERSION"

if [ "$DRY_RUN" = true ]; then
    log_warning "DRY RUN MODE - No changes will be made"
fi

echo ""
echo "========================================"
echo "  Publishing $PACKAGE_NAME"
echo "  $CURRENT_VERSION → $NEW_VERSION"
echo "========================================"
echo ""

# Confirm
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Aborted"
    exit 0
fi

# Run tests
if [ "$SKIP_TESTS" = false ]; then
    log_info "Running tests..."
    pnpm test:run
    log_success "Tests passed"
fi

# Build
log_info "Building..."
pnpm build
log_success "Build completed"

# Update version in package.json
log_info "Updating version to $NEW_VERSION..."
cd "$PACKAGE_DIR"

if [ "$DRY_RUN" = false ]; then
    # Update version using node
    node -e "
        const fs = require('fs');
        const pkg = require('./package.json');
        pkg.version = '$NEW_VERSION';
        fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    log_success "Version updated"
fi

# Publish to npm
log_info "Publishing to npm..."
if [ "$DRY_RUN" = true ]; then
    npm publish --dry-run
else
    npm publish --access public
fi
log_success "Published to npm"

cd - > /dev/null

# Git operations
if [ "$SKIP_GIT" = false ] && [ "$DRY_RUN" = false ]; then
    log_info "Creating git tag..."

    # Commit version change
    git add "$PACKAGE_DIR/package.json"
    git commit -m "chore: release $PACKAGE_NAME@$NEW_VERSION"

    # Create tag
    TAG_NAME="v$NEW_VERSION"
    git tag -a "$TAG_NAME" -m "Release $NEW_VERSION"

    log_success "Created tag: $TAG_NAME"

    # Push
    log_info "Pushing to remote..."
    git push origin HEAD
    git push origin "$TAG_NAME"
    log_success "Pushed to remote"
fi

echo ""
echo "========================================"
log_success "Successfully published $PACKAGE_NAME@$NEW_VERSION"
echo "========================================"
echo ""
echo "View on npm: https://www.npmjs.com/package/$PACKAGE_NAME"
