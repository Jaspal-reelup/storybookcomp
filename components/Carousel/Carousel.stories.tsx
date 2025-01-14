import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import React from "react";
import { View } from "react-native";
import { VideoCarousel } from "./Carousel";

// Sample video data
const sampleVideos = [
  {
    id: '1',
    title: 'Big Buck Bunny',
    thumbnail: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    duration: '10:30',
    views: 1234567,
    author: 'Nature Channel',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: '2',
    title: 'Elephants Dream',
    thumbnail: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    duration: '15:45',
    views: 987654,
    author: 'Space Science',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  },
  {
    id: '3',
    title: 'For Bigger Blazes',
    thumbnail: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    duration: '12:20',
    views: 567890,
    author: 'Ocean Explorer',
    videoUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  }
];

const meta = {
  title: "VideoCarousel",
  component: VideoCarousel,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onVideoPress: { action: 'video pressed' },
    showControls: {
      control: 'boolean',
      description: 'Show or hide video controls',
      defaultValue: true
    }
  },
  decorators: [
    (Story) => (
        <View style={{ flex: 1, backgroundColor: '#f5f5f5', height: '100%' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof VideoCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    
    onVideoPress: action("onVideoPress")
  }
};
export const WithLazyLoading: Story = {
  args: {
    onVideoPress: action("onVideoPress"),
    showControls: true,
    apiKey:'BaD9xAoNJE5aVdVTflgvRIxjetKq2UCN',
    width:200,
    height:400,
    isLazy:true,
    batchSize: 5,
  }
};

export const WithoutLazyLoading: Story = {
    args: {
      onVideoPress: action("onVideoPress"),
      showControls: true,
      apiKey:'BaD9xAoNJE5aVdVTflgvRIxjetKq2UCN',
      width:200,
      height:400,
      batchSize: 5,
    }
  };






