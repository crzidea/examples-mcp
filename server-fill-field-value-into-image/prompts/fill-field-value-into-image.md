# Fill Field Values into Image

## Objective

The goal is to fill specific field values into an image by leveraging a multi-modal LLM to convert the image into an HTML format, retrieving the necessary field values, and then embedding these values into the HTML. The generated HTML should be a pixel-perfect visual replica of the original image, with all specified fields accurately populated, maintaining exact layout, font styles, and spacing.

## Steps

1. **Convert Image to HTML**:
   - Utilize the capabilities of a multi-modal LLM to convert the image into an HTML format. This HTML must precisely replicate the visual appearance of the original image, including all text, lines, spacing, and structural elements. Pay close attention to the positioning and sizing of all components.

2. **Retrieve Field Values**:
   - Utilize the MCP tool `get_example_field_values` to obtain the necessary field values. Ensure that the tool is correctly configured and that the values are retrieved in the expected format.

3. **Fill Field Values into HTML**:
   - Insert the retrieved field values into the corresponding fields within the HTML. The insertion must be done in a way that preserves the original layout, font styles, and visual cues (e.g., underlines, bold text). Ensure that the values are placed accurately and that the HTML structure and styling (including CSS for `position`, `top`, `left`, `font-family`, `font-size`, `font-weight`, `line-height`, `margin`, and `padding`) are meticulously maintained to match the original image pixel-perfectly.

4. **Save HTML**:
   - Call `save_example_html` to save the HTML after all field values have been inserted.

## Considerations

- Ensure that the HTML conversion maintains the visual integrity of the original image, including all graphical elements and background. The generated HTML should be a faithful representation of the *entire* original image, not just a textual extraction.
- Ensure that the HTML page size matches the image's height and width precisely, using appropriate CSS for `body` or root elements.
- Validate the field values before insertion to prevent any errors or inconsistencies.
- Ensure the HTML content is capable of being converted to PDF and printed without any layout shifts or rendering issues. Strictly use print-specific CSS (e.g., `@media print`) where necessary to maintain layout fidelity.
- When outputting HTML, strictly use full-width punctuation for Chinese text (，、。；：？！“”‘’（）《》【】——……). If the sentences are in English, use standard punctuation.
- Test the final output to ensure that the field values are correctly displayed in the image and that the overall visual fidelity is maintained.
- Pay extremely close attention to the alignment and spacing of text and fields. Use precise CSS positioning (e.g., `position: absolute`, `top`, `left`, `line-height`, `margin`, `padding`) to ensure every element is placed exactly as it appears in the original image. Replicate all lines and underlines that act as placeholders.
