# Vaultopolis Design System

## Hierarchical Container System

### Core Principle
**ContentPanel for information, Card for interaction**

### ContentPanel Component
- **Purpose**: Base container for all informational content sections
- **Styling**: `bg-white/10 border border-white/20` with white text
- **Usage**: Page sections, FAQ categories, guide descriptions, informational blocks
- **Props**: `title`, `subtitle`, `padding` (sm/md/lg/xl)

### Card Component  
- **Purpose**: Interactive elements and highlighted data within ContentPanel
- **Variants**: 
  - `accent`: Featured/primary actions (green gradient)
  - `elevated`: Regular interactive elements (subtle shadow)
  - `secondary`: Secondary actions
- **Usage**: Guide cards, CTA buttons, swap interfaces, interactive modules

### Visual Hierarchy
1. **ContentPanel**: Dark, subtle background - "this is information to read"
2. **Card**: Elevated, interactive styling - "this is something you can do"

### Implementation Rules
- ✅ **ContentPanel** wraps all main content sections
- ✅ **Card** components are placed inside ContentPanel for interactions
- ✅ **PageWrapper** handles consistent spacing from header
- ✅ **Button** component for all CTAs with consistent variants

### Benefits
- Clear visual distinction between information and action
- Maintains gradient background effect through semi-transparent containers
- Reduces cognitive load with consistent patterns
- Scalable and maintainable design system

## Examples

### Guides Page
```jsx
<ContentPanel title="Complete Guides & Tutorials">
  <Card variant="accent">Featured Guide</Card>
  <Card variant="elevated">Regular Guide</Card>
</ContentPanel>
```

### FAQ Page
```jsx
<ContentPanel title="Frequently Asked Questions">
  <div className="grid">
    <div className="bg-white/5">FAQ Category</div>
  </div>
  <Button variant="primary">CTA Action</Button>
</ContentPanel>
```
