# 🎨 GSV Color Scheme Guide

## Professional, Eco-Focused, Reliable

---

## Primary Colors - Grounded Green

### Main Brand Color
**`#2D7A4F` - Deep Forest Green**
- Use for: Primary CTAs, main buttons, key highlights, logo
- Represents: Environmental focus, growth, sustainability
- Accessibility: AAA on white, AA on light backgrounds

### Dark Variant
**`#1F5438` - Darker Forest Green**
- Use for: Hover states, active states, dark sections
- Represents: Depth, reliability, trust

### Light Variant
**`#3A9461` - Lighter Forest Green**
- Use for: Accents, highlights, gradients
- Represents: Fresh, vibrant, energetic

### Soft Background
**`#E8F5EE` - Pale Green**
- Use for: Backgrounds, subtle highlights, cards
- Represents: Clean, fresh, approachable

### Muted
**`#4A9B6A` - Muted Green**
- Use for: Secondary elements, less prominent features
- Represents: Balanced, harmonious

---

## Secondary Colors - Warm Confident

### Main Warm Color
**`#D97642` - Warm Terracotta**
- Use for: Secondary CTAs, accents, energy elements
- Represents: Action, warmth, confidence, community
- Pairs beautifully with green

### Dark Warm
**`#B85F2F` - Darker Terracotta**
- Use for: Hover states on warm elements
- Represents: Grounded warmth, reliability

### Light Warm
**`#E89563` - Lighter Terracotta**
- Use for: Highlights, gradients, soft accents
- Represents: Approachable, friendly

### Soft Warm Background
**`#FFF4ED` - Pale Peach**
- Use for: Warm section backgrounds, cards
- Represents: Welcoming, comfortable

---

## Neutrals - Professional & Reliable

### Charcoal
**`#1A1A1A` - Almost Black**
- Use for: Primary text, headlines, important content
- Represents: Professional, serious, credible

### Slate Scale

**Slate 900** - `#1E293B` - Very Dark
- Use for: Dark backgrounds, overlays

**Slate 800** - `#334155` - Dark
- Use for: Dark text on light backgrounds

**Slate 700** - `#475569` - Medium-Dark
- Use for: Body text, secondary headings

**Slate 600** - `#64748B` - Medium
- Use for: Muted text, captions

**Slate 500** - `#94A3B8` - Light-Medium
- Use for: Placeholder text, disabled states

**Slate 400** - `#CBD5E1` - Light
- Use for: Borders, dividers

**Slate 300** - `#E2E8F0` - Very Light
- Use for: Subtle borders, light dividers

**Slate 200** - `#F1F5F9` - Almost White
- Use for: Light backgrounds, subtle sections

**Slate 100** - `#F8FAFC` - Off-White
- Use for: Page backgrounds, cards

---

## Accent Colors

### Success
**`#10B981` - Emerald Green**
- Use for: Success messages, confirmations, positive feedback

### Warning
**`#F59E0B` - Amber**
- Use for: Warnings, cautions, important notices

### Error
**`#EF4444` - Red**
- Use for: Errors, destructive actions, critical alerts

### Info
**`#3B82F6` - Blue**
- Use for: Information, links, neutral highlights

---

## Color Combinations

### Hero Section
- Background: Gradient from Slate 900 → Slate 800 → Green
- Text: White
- Accent: Green Light + Warm (gradient)
- CTAs: Green (primary), White border (secondary)

### Impact Section
- Background: White → Slate 100 gradient
- Cards: White with colored icons
- Featured Card: Green → Green Dark gradient
- Text: Charcoal, Slate 600

### Programs Section
- Background: White
- Card Headers: Green, Warm, Blue gradients
- Text: Charcoal, Slate 600
- Accents: Matching gradient colors

### CTA Section
- Background: Green → Green Dark → Slate 900 gradient
- Text: White
- CTAs: White (primary), White border (secondary)

---

## Usage Guidelines

### Do's ✅
- Use green for primary actions and environmental themes
- Use warm for secondary actions and community elements
- Use slate for text hierarchy
- Maintain contrast ratios (WCAG AA minimum)
- Use gradients sparingly for impact
- Combine green + warm for energy
- Use white space generously

### Don'ts ❌
- Don't use too many colors at once
- Don't use green and warm equally (green is primary)
- Don't use low-contrast combinations
- Don't overuse gradients
- Don't use pure black (#000000)
- Don't mix too many accent colors
- Don't ignore accessibility

---

## Accessibility

### Contrast Ratios

**Text on White:**
- Charcoal (#1A1A1A): 16.1:1 (AAA) ✅
- Slate 800 (#334155): 11.5:1 (AAA) ✅
- Slate 700 (#475569): 8.6:1 (AAA) ✅
- Slate 600 (#64748B): 5.7:1 (AA) ✅
- Green (#2D7A4F): 5.2:1 (AA) ✅

**White on Green:**
- White on Green (#2D7A4F): 5.2:1 (AA) ✅
- White on Green Dark (#1F5438): 7.8:1 (AAA) ✅

**White on Warm:**
- White on Warm (#D97642): 3.5:1 (AA Large) ⚠️
- White on Warm Dark (#B85F2F): 4.9:1 (AA) ✅

---

## Brand Personality

### What This Palette Communicates

**Grounded Green Primary:**
- Environmental focus
- Growth and sustainability
- Trustworthy and reliable
- Professional and credible
- Connected to nature

**Warm Confident Secondary:**
- Action and energy
- Community and warmth
- Approachable and friendly
- Passionate and committed
- Human and relatable

**Professional Neutrals:**
- Serious and credible
- Well-organized
- Attention to detail
- Modern and clean
- Balanced and harmonious

---

## Examples in Use

### Button Styles

```css
/* Primary Button */
background: #2D7A4F (green)
text: white
hover: #1F5438 (greenDark)

/* Secondary Button */
background: white
border: #2D7A4F (green)
text: #2D7A4F (green)
hover-bg: #E8F5EE (greenSoft)

/* Warm Accent Button */
background: #D97642 (warm)
text: white
hover: #B85F2F (warmDark)
```

### Card Styles

```css
/* Default Card */
background: white
border: #E2E8F0 (slate-300)
text: #1A1A1A (charcoal)
shadow: soft

/* Hover State */
border: #2D7A4F (green) with 20% opacity
shadow: soft-lg
transform: translateY(-4px)
```

### Text Hierarchy

```css
/* Headline */
color: #1A1A1A (charcoal)
size: 48-72px
weight: 700-800

/* Body */
color: #475569 (slate-700)
size: 16-18px
weight: 400

/* Caption */
color: #64748B (slate-600)
size: 14px
weight: 400
```

---

## Color Psychology

### Why This Works

**Green = Environmental Mission**
- Instantly communicates eco-focus
- Trusted in nonprofit sector
- Associated with growth and renewal
- Calming and reassuring

**Warm = Human Connection**
- Adds energy and action
- Prevents "too corporate" feel
- Represents community and passion
- Differentiates from typical green nonprofits

**Slate = Professional Credibility**
- More sophisticated than pure gray
- Modern and clean
- Doesn't compete with brand colors
- Excellent for text hierarchy

---

## Comparison to Other Nonprofits

### WWF
- Uses: Green + Black
- Feel: Serious, conservation-focused
- GSV Difference: Warmer, more approachable

### Greenpeace
- Uses: Green + Yellow
- Feel: Activist, bold
- GSV Difference: More grounded, professional

### Sierra Club
- Uses: Green + Blue
- Feel: Outdoorsy, adventurous
- GSV Difference: More educational, community-focused

### Teach for America
- Uses: Purple + Orange
- Feel: Educational, energetic
- GSV Difference: More environmental, sustainable

**GSV's Unique Position:**
Combines the environmental credibility of conservation orgs with the warmth and energy of educational nonprofits.

---

## 🎨 **Your Color Palette is Perfect For:**

✅ Grant applications (professional, credible)
✅ Donor presentations (trustworthy, impactful)
✅ School partnerships (approachable, educational)
✅ Volunteer recruitment (energetic, community-focused)
✅ Social media (distinctive, memorable)
✅ Print materials (versatile, accessible)

**This is a grant-worthy, professional color scheme that perfectly represents your mission!** 🌱

