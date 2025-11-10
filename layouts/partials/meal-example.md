# Meal Component Usage Examples

## Basic Usage

The meal component can be used in multiple ways:

### 1. Using with menu data (current implementation)

```go
{{ range .items }}
    {{ partial "meal.html" . }}
{{ end }}
```

### 2. Using with a dictionary

```go
{{ partial "meal.html" (dict "name" "Grilled Salmon" "price" 24.99 "description" "Fresh Atlantic salmon") }}
```

### 3. Using with full parameters

```go
{{ partial "meal.html" (dict 
    "name" "Vegetarian Risotto" 
    "price" 17.99 
    "description" "Creamy arborio rice with seasonal vegetables"
    "dietary" "Vegetarian"
    "spicy" "Mild"
    "size" "Regular"
    "image" "/images/risotto.jpg"
) }}
```

## Available Parameters

- **name** (required): Name of the meal/item
- **price** (required): Price of the meal (number)
- **description** (optional): Description of the meal
- **image** (optional): URL to an image of the meal
- **dietary** (optional): Dietary information badge (e.g., "Vegetarian", "Gluten-Free", "Vegan")
- **spicy** (optional): Spice level badge (e.g., "Mild", "Medium", "Hot")
- **size** (optional): Size options (e.g., "Small", "Medium", "Large")

## Example: Adding to menu.json

You can extend menu items in `data/menu.json` with additional fields:

```json
{
  "name": "Grilled Salmon",
  "price": 24.99,
  "description": "Atlantic salmon fillet grilled to perfection",
  "dietary": "Gluten-Free",
  "spicy": "Mild",
  "image": "/images/salmon.jpg"
}
```

