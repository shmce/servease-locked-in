# ServEase Admin Dashboard - Design System Documentation

## Brand Identity
**Primary Color**: `#00BF63` (Green)  
**Color Palette**: White backgrounds + Green primary + Neutral grays

## Interactive Component Library

### 1. **IconButton Component**
Location: `/src/app/components/shared/IconButton.tsx`

**Features**:
- ✅ Icon-only button with automatic tooltip
- ✅ Multiple variants: `default`, `ghost`, `destructive`, `outline`
- ✅ Multiple sizes: `sm`, `md`, `lg`
- ✅ Loading state with spinner
- ✅ Disabled state with reduced opacity
- ✅ Full keyboard accessibility (focus states)
- ✅ Cursor pointer on hover

**Usage**:
```tsx
import { IconButton } from "../components/shared/IconButton";
import { Trash2, Edit } from "lucide-react";

<IconButton 
  icon={Edit} 
  tooltip="Edit item"
  variant="ghost"
  onClick={() => handleEdit()}
/>

<IconButton 
  icon={Trash2} 
  tooltip="Delete item"
  variant="destructive"
  loading={isDeleting}
  onClick={() => handleDelete()}
/>
```

**States**:
- **Default**: Base appearance
- **Hover**: Background color change (light green for ghost)
- **Active**: Darker background
- **Disabled**: 50% opacity, no pointer events
- **Loading**: Spinning loader icon

---

### 2. **ActionMenu Component**
Location: `/src/app/components/shared/ActionMenu.tsx`

**Features**:
- ✅ Three-dots (⋮) menu for table actions
- ✅ Desktop: Anchored dropdown menu
- ✅ Mobile: Bottom sheet modal
- ✅ Closes on outside click
- ✅ Closes on ESC key
- ✅ Only one menu open at a time
- ✅ Support for dividers
- ✅ Danger actions (red color)
- ✅ Disabled items with helper text
- ✅ Icon support for each menu item

**Usage**:
```tsx
import { ActionMenu } from "../components/shared/ActionMenu";
import { Eye, Edit, Trash2, Power } from "lucide-react";

<ActionMenu
  items={[
    {
      label: "View Details",
      icon: Eye,
      onClick: () => navigate(`/detail/${id}`)
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: () => setEditMode(true)
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: () => handleDelete(),
      variant: "danger",
      divider: true
    },
    {
      label: "Deactivate",
      icon: Power,
      onClick: () => {},
      disabled: true,
      helperText: "Can't deactivate the last Super Admin"
    }
  ]}
  align="right"
/>
```

**Menu Items Interface**:
```tsx
interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
  helperText?: string;  // Shows below label when disabled
  divider?: boolean;     // Adds divider above this item
}
```

---

### 3. **LoadingButton Component**
Location: `/src/app/components/shared/LoadingButton.tsx`

**Features**:
- ✅ Extended Button component with loading state
- ✅ Automatic brand color (#00BF63) for primary variant
- ✅ Spinner icon when loading
- ✅ Disabled during loading
- ✅ All standard button variants supported

**Usage**:
```tsx
import { LoadingButton } from "../components/shared/LoadingButton";

<LoadingButton
  variant="default"
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Save Changes
</LoadingButton>

<LoadingButton
  variant="destructive"
  loading={isDeleting}
  onClick={handleDelete}
>
  Delete Item
</LoadingButton>
```

**Button Variants & States**:

| Variant | Default | Hover | Active | Disabled |
|---------|---------|-------|--------|----------|
| **Primary (default)** | `#00BF63` bg, white text | `#00A055` | `#008F4A` | Gray bg |
| **Secondary** | White bg, gray border | Light gray bg | Darker gray | 50% opacity |
| **Destructive** | Red bg | Darker red | Even darker | 50% opacity |
| **Outline** | White bg, border | Light gray bg | Gray bg | 50% opacity |
| **Ghost** | Transparent | Light green bg | Lighter green | 50% opacity |

---

### 4. **ResponsiveGrid Component**
Location: `/src/app/components/shared/ResponsiveGrid.tsx`

**Features**:
- ✅ Automatic responsive grid layout
- ✅ Configurable columns per breakpoint
- ✅ Configurable gap spacing
- ✅ Mobile-first design

**Usage**:
```tsx
import { ResponsiveGrid } from "../components/shared/ResponsiveGrid";

<ResponsiveGrid
  cols={{ default: 1, md: 2, lg: 3, xl: 4 }}
  gap={6}
>
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</ResponsiveGrid>
```

**Default Configuration**:
- Mobile (default): 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns
- Large Desktop (xl): 4 columns

**Breakpoints**:
- `default`: Mobile (< 768px)
- `sm`: Small tablets (≥ 640px)
- `md`: Tablets (≥ 768px)
- `lg`: Desktop (≥ 1024px)
- `xl`: Large desktop (≥ 1280px)

---

## Global Navigation

### Header Component
Location: `/src/app/components/navigation/Header.tsx`

**Features**:
- ✅ Global search bar
- ✅ Notifications dropdown with unread badge
- ✅ Profile dropdown menu
- ✅ Logout functionality
- ✅ Clickable notifications
- ✅ Proper cursor states
- ✅ Closes on outside click / ESC

**Interactive Elements**:
1. **Search Input**: Focus state, typing state
2. **Notifications Bell**: 
   - Shows badge count
   - Opens dropdown on click
   - Highlights unread notifications
3. **Profile Dropdown**:
   - My Profile
   - Account Settings
   - Security
   - Sign Out (danger state)

---

### Sidebar Component
Location: `/src/app/components/navigation/Sidebar.tsx`

**Features**:
- ✅ Active route highlighting (#00BF63)
- ✅ Collapsible with smooth animation
- ✅ Tooltips in collapsed state
- ✅ Hover states (light green background)
- ✅ Grouped navigation sections
- ✅ Icon consistency

**Active State**: `bg-[#00BF63]` with white text  
**Hover State**: `bg-[#DCFCE7]` with dark green text

---

## Typography

### Heading Hierarchy
- **Page Title** (h1): 3xl, bold, gray-900
- **Section Title** (h2): 2xl, bold, gray-900
- **Card Title** (h3): xl, semibold, gray-900
- **Label**: base, medium, gray-700
- **Body**: base, normal, gray-600

---

## Color System

### Primary Brand Color: #00BF63

**Shades**:
- **Primary**: `#00BF63`
- **Hover**: `#00A055` (8-10% darker)
- **Active**: `#008F4A` (12-15% darker)
- **Light**: `#DCFCE7` (background tint)
- **Very Light**: `#BBF7D0` (active background)

### Status Colors

| Status | Background | Text | Border | Icon |
|--------|------------|------|--------|------|
| **Success/Active** | `bg-[#DCFCE7]` | `text-[#15803D]` | `border-[#BBF7D0]` | Green |
| **Pending/Warning** | `bg-yellow-100` | `text-yellow-700` | `border-yellow-200` | Orange |
| **Inactive/Neutral** | `bg-gray-100` | `text-gray-600` | `border-gray-200` | Gray |
| **Danger/Error** | `bg-red-100` | `text-red-700` | `border-red-200` | Red |
| **Info** | `bg-blue-100` | `text-blue-700` | `border-blue-200` | Blue |

---

## Badge Component Patterns

### Status Badges
```tsx
// Active/Success
<Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
  <CheckCircle className="w-3 h-3 mr-1" />
  Active
</Badge>

// Pending
<Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
  <Clock className="w-3 h-3 mr-1" />
  Pending
</Badge>

// Inactive
<Badge className="bg-gray-100 text-gray-600 border-gray-200">
  <XCircle className="w-3 h-3 mr-1" />
  Inactive
</Badge>
```

---

## Modal/Dialog Patterns

### Centered Modal (Preferred)
- Desktop: Centered overlay with backdrop
- Mobile: Full-width with internal scroll
- Sticky footer with actions
- Close with X button, ESC, or outside click

### Bottom Sheet (Mobile Only)
- Slides up from bottom
- Drag handle at top
- Used for ActionMenu on mobile
- Cancel button at bottom

---

## Form Controls

### Input States
- **Default**: Light gray background, gray border
- **Focus**: Green ring (#00BF63)
- **Error**: Red ring, red border
- **Disabled**: Gray background, reduced opacity

### Button Minimum Touch Target
- Minimum: 32x32px (mobile)
- Recommended: 40x40px for icon buttons
- Standard button height: 40px (h-10)

---

## Accessibility Checklist

✅ **Keyboard Navigation**
- All interactive elements have focus states
- Tab order is logical
- ESC closes menus and modals

✅ **Screen Readers**
- Icon buttons have tooltips or aria-labels
- Status badges have proper text
- Loading states announced

✅ **Visual Feedback**
- Hover states on all clickable elements
- `cursor-pointer` on all interactive elements
- Active/pressed states visible
- Disabled states clearly indicated

✅ **Touch Targets**
- Minimum 32x32px touch areas
- Adequate spacing between clickable elements
- Mobile-friendly bottom sheets for menus

---

## Responsive Patterns

### Desktop (≥ 1024px)
- Sidebar visible
- Multi-column layouts
- Dropdown menus
- Hover tooltips

### Tablet (768px - 1023px)
- Sidebar may collapse
- 2-column layouts
- Dropdowns or bottom sheets
- Tables may scroll horizontally

### Mobile (< 768px)
- Sidebar as drawer
- Single column layouts
- Bottom sheets for menus
- Cards replace tables
- Full-width modals

---

## Implementation Checklist

✅ **Global Components**
- [x] Header with notifications & profile dropdown
- [x] Sidebar with active states & collapse
- [x] IconButton with tooltips
- [x] LoadingButton with all states
- [x] ActionMenu (3-dots) with mobile support
- [x] ResponsiveGrid for card layouts

✅ **Theme & Colors**
- [x] Primary color: #00BF63
- [x] Hover/active color variants
- [x] Status color system
- [x] Focus ring colors

✅ **Interaction States**
- [x] Default, hover, active, disabled, loading
- [x] Focus states for keyboard navigation
- [x] Cursor pointer on clickables
- [x] Tooltips on icon-only buttons

✅ **Responsive Design**
- [x] Mobile-first grid system
- [x] Breakpoint-based layouts
- [x] Bottom sheets for mobile menus
- [x] Collapsible sidebar

---

## Usage Examples

### Complete Table with Action Menu
```tsx
import { ActionMenu } from "../components/shared/ActionMenu";
import { LoadingButton } from "../components/shared/LoadingButton";
import { Eye, Edit, Trash2, Download } from "lucide-react";

function DataTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <Badge className="bg-[#DCFCE7] text-[#15803D]">
                Active
              </Badge>
            </TableCell>
            <TableCell>
              <ActionMenu
                items={[
                  {
                    label: "View Details",
                    icon: Eye,
                    onClick: () => navigate(`/details/${item.id}`)
                  },
                  {
                    label: "Edit",
                    icon: Edit,
                    onClick: () => setEditMode(item.id)
                  },
                  {
                    label: "Download",
                    icon: Download,
                    onClick: () => handleDownload(item.id)
                  },
                  {
                    label: "Delete",
                    icon: Trash2,
                    onClick: () => handleDelete(item.id),
                    variant: "danger",
                    divider: true
                  }
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## Next Steps for Full Consistency

1. **Update all table pages** to use ActionMenu component
2. **Replace standard buttons** with LoadingButton where async actions exist
3. **Add tooltips** to all icon-only buttons
4. **Implement ResponsiveGrid** on dashboard and card-based pages
5. **Ensure all modals** use consistent centered overlay pattern
6. **Add focus states** to custom interactive elements
7. **Test keyboard navigation** on all pages
8. **Verify mobile responsiveness** for all pages

---

**Last Updated**: March 4, 2026  
**Version**: 2.0  
**Theme Color**: #00BF63
