export type Component = {
  type: string;
  attributes: {
    [key: string]: any;
  };
};

type ComponentDefinition = {
  type: string;
  description: string;
  template: Omit<Component, "type">;
  documentation: {
    attributes: {
      [key: string]: string;
    };
  };
};

type ComponentDefinitionMap = {
  [key: string]: ComponentDefinition;
};

export const componentDefinitionMap: ComponentDefinitionMap = {
  label: {
    description: "A simple text label",
    template: {
      attributes: {
        text: "Label",
      },
    },
    documentation: {
      attributes: {
        text: "The text to display",
      },
    },
    type: "",
  },
  input: {
    description: "A text input field",
    template: {
      attributes: {
        placeholder: "Enter text",
        value: "",
      },
    },
    documentation: {
      attributes: {
        placeholder: "Placeholder text for the input",
        value: "Initial value of the input",
      },
    },
    type: "",
  },
  button: {
    description: "A clickable button",
    template: {
      attributes: {
        text: "Click Me",
      },
    },
    documentation: {
      attributes: {
        text: "The text to display on the button",
      },
    },
    type: "",
  },
};
