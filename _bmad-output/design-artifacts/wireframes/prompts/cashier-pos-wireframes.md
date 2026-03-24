# Wireframe Generation Prompts: Cashier POS

**Context:** The application is a high-speed Point of Sale (POS) system for the F&B industry named "pos-sdd".
**Style:** Mid-Fi, Minimalist ("The Modern Bistro" style: spacious, very few borders, no heavy shadows, rounded corners, clean layouts), annotated with text labels explaining interaction hitbox zones and state, 1280px Desktop/Tablet landscape width.
**Color Palette:** Grayscale.

---

## 1. Cashier POS: Order Grid Menu & Cart (Snap-Order Flow)

### Midjourney / DALL-E 3 Prompt:
`A mid-fidelity UI wireframe for a modern Point of Sale (POS) tablet app (landscape 1280px). The layout is divided into 2 columns. Left column: A grid menu with "Snap-Order Cards" (large hitboxes, placeholder images, bold text for item name and price). Right column: A shopping cart list showing selected items. Underneath one of the cart items, a contextual sliding panel is open, showing modifier options like size and toppings. The top of the right column has a prominent "Select Customer" button. The bottom of the right column has a giant "Checkout / Pay" button. Style: Minimalist, clean, wireframe, grayscale, rounded corners (glassmorphism influence), spacious. Add textual annotations pointing to key interactive elements.`

### V0.dev / Claude / System Prompt:
```markdown
Create a mid-fidelity wireframe layout in HTML/Tailwind for a Cashier POS Order screen (1280px width). 
- **Style:** Clean, minimalist ("Modern Bistro"), grayscale, using large rounded corners (rounded-2xl) and subtle or no borders.
- **Layout:** 2 columns (Left: 70%, Right: 30%).
- **Left Column (Grid Menu):** Category tabs at the top. Below them, a grid of "Snap-Order Cards". Each card should have a 44x44px minimum interaction area, an image placeholder, an item name, and a bold price.
- **Right Column (Cart):** A "Select Customer" button at the top. A list of ordered items. For the second item, show an inline contextual sliding panel (a sub-menu embedded right below the item) to choose modifiers (e.g., "Add Ice", "Large Size"). 
- **Bottom Right:** A massive, highly visible "Checkout" button.
- **Annotations:** Include text notes next to the interface to explicitly point out "Zero-latency feedback zone" and "Giant Hitbox for speed".
```

---

## 2. Cashier POS: Visual Floor Plan (Table Management)

### Midjourney / DALL-E 3 Prompt:
`A mid-fidelity UI wireframe for a modern Point of Sale (POS) restaurant table management screen (landscape 1280px). The center shows a grid of "Smart Seat" table widgets representing different restaurant tables. Tables are colored in different shades of gray to indicate states: empty, occupied (showing order value), waiting, and dirty. At the bottom, there is a "Global Order Toolbar" for searching and quick actions. Style: Minimalist, clean, wireframe, grayscale, soft rounded corners, very little clutter. Add textual annotations suggesting "Drag and drop to merge tables" and "Tap to open order".`

### V0.dev / Claude / System Prompt:
```markdown
Create a mid-fidelity wireframe layout in HTML/Tailwind for a Cashier POS Visual Floor Plan screen (1280px width).
- **Style:** Clean, minimalist ("Modern Bistro"), grayscale.
- **Layout:** Full screen map view.
- **Center Area:** A layout of square and rectangular "Table Widgets". Show different states using shades of gray: 
  - Table 1: Empty (White background, light gray border).
  - Table 2: Occupied (Dark gray background, displays "$145.00" and "00:45 min").
  - Table 3: Dirty (Medium gray, displays a broom icon).
- **Bottom/Top Area:** A Global Order Toolbar, containing a search bar, a toggle for different floor zones, and a quick summary.
- **Annotations:** Include text notes indicating "Drag and Drop to merge tables".
```
