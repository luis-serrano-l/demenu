# Dynamic Menu - Hugo Static Site

A dynamic restaurant menu website built with Hugo (Go-based static site generator) that can be deployed to GitHub Pages.

## Project Overview

This project creates a beautiful, responsive restaurant menu website with:
- Food items organized by categories (Appetizers, Main Courses, Desserts, Beverages, etc.)
- Sample food data with descriptions and prices
- Dynamic menu display with filtering capabilities
- GitHub Pages deployment ready

## Project Structure

```
demenu/
├── README.md                 # This file
├── hugo.toml                 # Hugo configuration
├── .gitignore              # Git ignore rules
├── .github/
│   └── workflows/
│       └── gh-pages.yml    # GitHub Actions workflow for deployment
├── content/
│   ├── _index.md           # Home page
│   └── menu/
│       └── _index.md       # Menu page
├── data/
│   └── menu.json           # Menu data (categories and food items)
├── static/
│   ├── css/
│   │   └── custom.css      # Custom styles
│   └── js/
│       └── menu.js         # Menu filtering/interaction logic
├── themes/                  # Hugo themes (if using a theme)
└── layouts/
    ├── _default/
    │   ├── baseof.html     # Base template
    │   ├── list.html       # List template
    │   └── single.html     # Single page template
    └── partials/
        ├── header.html     # Header partial
        ├── footer.html     # Footer partial
        └── menu.html       # Menu display partial
```

## Prerequisites

- [Hugo](https://gohugo.io/) installed (version 0.100.0 or later recommended)
  - Check installation: `hugo version`
  - Install via package manager or download from [Hugo releases](https://github.com/gohugoio/hugo/releases)
- Git installed
- GitHub account (for GitHub Pages deployment)

## Setup Instructions

### 1. Install Hugo

**On Linux:**
```bash
# Using snap
sudo snap install hugo

# Or download from GitHub releases
wget https://github.com/gohugoio/hugo/releases/download/v0.121.0/hugo_0.121.0_linux-amd64.deb
sudo dpkg -i hugo_0.121.0_linux-amd64.deb
```

### 2. Verify Installation

```bash
hugo version
```

### 3. Initialize Hugo Site

If you're starting from scratch, first initialize a Hugo site:

```bash
# Navigate to your project directory
cd /path/to/demenu

# Initialize Hugo site (if not already done)
hugo new site . --force
```

**Note:** The `--force` flag is only needed if the directory already contains files. This will create the proper Hugo directory structure.

### 4. Set Up Project Files

After initializing Hugo, copy or create the following files:
- `hugo.toml` - Configuration file (or `config.toml` in older Hugo versions)
- `content/` - Your content files
- `layouts/` - Template files
- `static/` - CSS, JS, and other static assets
- `data/` - Data files (like menu.json)
- `.github/workflows/` - GitHub Actions workflow for deployment

## Build Steps

### Local Development

1. **Start the Hugo development server:**
   ```bash
   hugo server --buildDrafts
   ```
   Or to include draft content:
   ```bash
   hugo server -D
   ```
   The site will be available at `http://localhost:1313`

2. **Build the site for production:**
   ```bash
   hugo --minify
   ```
   This creates a `public/` directory with the static site.

3. **Preview the production build:**
   ```bash
   hugo server --environment production
   ```

### Production Build

```bash
# Clean previous build
rm -rf public/

# Build with minification
hugo --minify

# The public/ directory contains your static site
```

## GitHub Pages Deployment

### Option 1: Using GitHub Actions (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/demenu.git
   git push -u origin main
   ```

2. **The GitHub Actions workflow will automatically:**
   - Build the Hugo site
   - Deploy to the `gh-pages` branch
   - Make your site available at `https://YOUR_USERNAME.github.io/demenu/`

3. **Enable GitHub Pages:**
   - Go to your repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `/ (root)`

### Option 2: Manual Deployment

1. **Build the site:**
   ```bash
   hugo --minify
   ```

2. **Push to gh-pages branch:**
   ```bash
   cd public
   git init
   git add .
   git commit -m "Deploy to GitHub Pages"
   git branch -M gh-pages
   git remote add origin https://github.com/YOUR_USERNAME/demenu.git
   git push -u origin gh-pages
   ```

### Configure Base URL

**For Local Development:**
The `hugo.toml` file is configured with `baseURL = "/"` for local development. This allows the site to work correctly at `http://localhost:1313/`.

**For Production (GitHub Pages):**
The GitHub Actions workflow automatically sets the correct `baseURL` using the GitHub Pages URL. However, if you need to manually build for production, you can:

1. Update `hugo.production.toml` with your GitHub Pages URL:
   ```toml
   baseURL = "https://YOUR_USERNAME.github.io/demenu/"
   ```

2. Build using the production config:
   ```bash
   hugo --config hugo.production.toml --minify
   ```

**Note:** The GitHub Actions workflow automatically handles the baseURL, so you don't need to manually update it for automated deployments.

## Development Workflow

1. **Make changes to content/data:**
   - Edit `data/menu.json` to update menu items
   - Edit `content/` files for pages
   - Edit `layouts/` for template changes

2. **Preview changes:**
   ```bash
   hugo server -D
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Update menu items"
   git push
   ```

## Menu Data Structure

The menu data is stored in `data/menu.json` with the following structure:

```json
{
  "categories": [
    {
      "id": "appetizers",
      "name": "Appetizers",
      "description": "Category description",
      "items": [
        {
          "name": "Item Name",
          "description": "Item description",
          "price": 9.99,
          "dietary": "Vegetarian",
          "spicy": "Mild",
          "size": "Regular",
          "image": "/images/item.jpg"
        }
      ]
    }
  ]
}
```

## Reusable Meal Component

The project includes a reusable meal component (`layouts/partials/meal.html`) that can be used to display menu items consistently throughout the site.

### Usage

**Basic usage with menu data:**
```go
{{ range .items }}
    {{ partial "meal.html" . }}
{{ end }}
```

**With custom parameters:**
```go
{{ partial "meal.html" (dict 
    "name" "Grilled Salmon" 
    "price" 24.99 
    "description" "Fresh Atlantic salmon"
    "dietary" "Gluten-Free"
    "image" "/images/salmon.jpg"
) }}
```

### Available Parameters

- **name** (required): Name of the meal/item
- **price** (required): Price of the meal (number)
- **description** (optional): Description of the meal
- **image** (optional): URL to an image of the meal
- **dietary** (optional): Dietary information badge (e.g., "Vegetarian", "Gluten-Free", "Vegan")
- **spicy** (optional): Spice level badge (e.g., "Mild", "Medium", "Hot")
- **size** (optional): Size options (e.g., "Small", "Medium", "Large")

The component automatically handles all optional fields and displays them only when provided.

## Customization

- **Styling:** Edit `static/css/custom.css`
- **Menu Logic:** Edit `static/js/menu.js`
- **Templates:** Edit files in `layouts/`
- **Menu Data:** Edit `data/menu.json`

## Troubleshooting

### Hugo not found
- Ensure Hugo is in your PATH
- Try `which hugo` to locate the binary

### Build errors
- Check Hugo version: `hugo version`
- Ensure all required directories exist
- Check `hugo.toml` (or `config.toml`) for syntax errors
- Make sure you initialized the site with `hugo new site .`

### GitHub Pages not updating
- Check GitHub Actions workflow status
- Verify `baseURL` in `hugo.toml` (or `config.toml`) matches your repository path
- Ensure `gh-pages` branch is set as the source in repository settings

## License

This project is open source and available for personal or commercial use.

