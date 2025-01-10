import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import React from "react";
import { View } from "react-native";
import { MyInput } from "./Input";

const meta = {
  title: "MyInput",
  component: MyInput,
  args: {
    text: "Hello world",
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof MyInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    setText: action("onPress"),

  },
};

export const Primary: Story = {
    args: {
        setText: action("onPress"),
    },
  };

  export const Custom: Story = {
    args: {
        setText: action("onPress"),
customStyle:{
    backgroundColor:'red',
    borderWidth:0,
    borderRadius:10,
    width:500
}
    },
  };
