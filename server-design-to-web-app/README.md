
## Prompts for testing

```
Create a form in JSON schema format, with 3 input components which with labels for each.
Hint: Do not manipulate JSON by yourself, use call `manipulate-form-json-schema` to edit it to avoid field errors.
Hint: You can call `get-supported-components` to get supported components list. Do not add any component by your self.
```

```
Add a submit button
```

````
Add a input field and label to the form
```json
{
  "attributes": {},
  "children": [
    {
      "type": "label",
      "attributes": {
        "text": "Label 3"
      }
    },
    {
      "type": "input",
      "attributes": {
        "placeholder": "Enter text...",
        "value": ""
      }
    },
    {
      "type": "button",
      "attributes": {
        "text": "Submit"
      }
    }
  ]
}
```
````
