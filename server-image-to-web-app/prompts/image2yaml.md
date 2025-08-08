# Image to YAML Conversion Guide

Act as an expert UI/UX designer. I will provide you with a design image. Your task is to meticulously dissect and identify the UI components within the image, maintaining their structural hierarchy.

**Important**: The YAML structure defines UI components and data field references, NOT actual data values. Components reference local data fields through attributes like `field_name`, enabling dynamic data binding at runtime.

## Analysis Constraints

Your analysis must adhere to the following constraints:

1.  **Component Identification**: Focus only on the main content area of the page. Ignore standard UI elements like headers, navigators, and footers.
2.  **Output Format**: The final response must be a well-structured YAML object. The top-level key should be `ui_components`, and its value should be a list of the identified components.
3.  **Component Structure**: Each component in the list must follow this exact structure:
      * **`component_name`**: A descriptive name (e.g., `button`, `text_field`, `card`).
      * **`type`**: The specific type of component (e.g., `primary_button`, `outlined_text_field`, `performance_card`).
      * **`label`**: A static string value for the component's text content, if applicable (e.g., `"Submit"`, `"Home"`).
      * **`field_name`**: Reference to local data source for dynamic content (e.g., `"user_name"`, `"task_list"`).
      * **`state`**: The current state of the component, if discernible (e.g., `active`, `disabled`, `default`).
      * **`properties`**: A nested dictionary for other relevant attributes. For container components (not list components), use `children` for child components. For list components, use `children_template` for the template structure.
4.  **Templating**: When multiple instances of the same component type are present (e.g., a list of cards or form fields), provide only a single, templated example. Do not list every instance. Use static string values for `title` and `label` fields. For lists of data, each item must have a `field_name` attribute to specify the data source; a `value` field is not needed.

## Key Data Binding Concepts

- **`label`**: Static text that doesn't change (e.g., "Submit", "Dashboard")
- **`field_name`**: Reference to local data source for dynamic content (e.g., "user_name", "task_list")
- **`value`**: NOT included in YAML - populated at runtime from `field_name` source
- **`children`**: Nested components within container elements (NOT used for list components)
- **`children_template`**: Template object for repeated child components in listing/collection components
- **`template`**: Indicates a component pattern for repeated elements

## YAML Structure Template

```yaml
ui_components:
  - component_name: [descriptive_name]
    type: [specific_component_type]
    label: [static_text_content_if_applicable]
    field_name: [data_source_reference_for_dynamic_content]
    state: [component_state]
    children:  # Only for container components, NOT list components
      - component_name: [child_component_name]
        type: [child_component_type]
        field_name: [child_data_source]
    # For list/collection components, use children_template instead:
    children_template:
      component_name: [template_component_name]
      type: [template_component_type]
      field_name: [template_data_source]
```

## Comprehensive Example

```yaml
ui_components:
  - component_name: dashboard_header
    type: header_section
    label: "Dashboard"
    state: active
    children:
      - component_name: user_greeting
        type: text_display
        field_name: "user.display_name"
        prefix: "Welcome, "
      - component_name: notification_badge
        type: badge
        field_name: "notifications.unread_count"
        
  - component_name: task_list
    type: card_grid
    layout: "2x3"
    field_name: "tasks"
    children_template:
      component_name: task_card
      type: task_card
      children:
        - component_name: task_title
          type: heading
          field_name: "title"
        - component_name: task_status
          type: status_badge
          field_name: "status"
        - component_name: view_button
          type: secondary_button
          label: "View Details"
            
  - component_name: quick_actions
    type: action_bar
    children:
      - component_name: add_task_button
        type: primary_button
        label: "Add New Task"
      - component_name: filter_dropdown
        type: dropdown
        label: "Filter"
        field_name: "filter_options"
```

## Data Source Examples

- `"user.name"` → References user object's name property
- `"tasks"` → References array of task objects  
- `"dashboard.metrics"` → References nested metrics data
- `"settings.theme"` → References configuration values

## Analysis Best Practices

### Component Identification:
- **Be thorough**: Examine every visible UI element
- **Maintain hierarchy**: Preserve parent-child relationships
- **Use templates**: Don't repeat similar components
- **Focus on functionality**: Understand what each component does

### Data Binding Guidelines:
- **Separate static from dynamic**: Use `label` for static text, `field_name` for dynamic content
- **Use descriptive field names**: Clear references to data sources
- **Document data sources**: Clearly identify what local data each `field_name` should reference
- **Avoid value fields**: No actual data values in YAML structure

### Common Component Types:
- **Containers**: `header_section`, `card_grid`, `action_bar`, `sidebar`
- **Interactive**: `primary_button`, `secondary_button`, `dropdown`, `text_field`
- **Display**: `heading`, `text_display`, `status_badge`, `avatar`
- **Navigation**: `tab_bar`, `breadcrumb`, `pagination`