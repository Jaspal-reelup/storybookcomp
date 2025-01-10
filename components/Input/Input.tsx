import React from "react";
import { StyleSheet, TextInput } from "react-native";

export interface MyInputProps {
  setText: (value: string) => void;
  text: string;
  placeholder?: string;
  customStyle?: object;
}

export const MyInput = ({ placeholder, customStyle, text, setText }: MyInputProps) => {
  return (
    <TextInput
      style={[styles.container, customStyle]}
      placeholder={placeholder}
      value={text}
      onChangeText={setText} // Properly passing the function
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 32,
    paddingVertical: 8,
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "lightblue",
  },
});
