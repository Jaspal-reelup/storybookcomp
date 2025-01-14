import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ViewabilityConfig,
  ViewToken,
  Animated,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { ResizeMode, Video } from "expo-av";

const { width: WINDOW_WIDTH } = Dimensions.get("window");
const DEFAULT_ITEM_WIDTH = WINDOW_WIDTH;
const DEFAULT_ITEM_HEIGHT = WINDOW_WIDTH * (16 / 9);
const BUFFER_SIZE = 1; // Number of items to load before and after visible items

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  short_video: string;
  duration: string;
  views: number;
  author: string;
  isLoaded?: boolean;
}

export interface VideoCarouselProps {
    onVideoPress?: (video: VideoItem) => void;
    showControls?: boolean;
    width?: number;
    height?: number;
    apiKey?: string;
    isLazy?: boolean;
    batchSize?: number; 
}

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export const VideoCarousel: React.FC<VideoCarouselProps> = ({
  onVideoPress,
  showControls = true,
  width = DEFAULT_ITEM_WIDTH,
  height = DEFAULT_ITEM_HEIGHT,
  apiKey,
  isLazy = false,
  batchSize = BUFFER_SIZE * 2 + 1
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [visibleIndices, setVisibleIndices] = useState<number[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<Video | null>(null);

  useEffect(() => {
    if (!apiKey) return;
    fetch('https://release.reelup.io/api/reels-data', {
      method: "GET",
      headers: {
        "X-Reelup-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const initialVideos = data.map((video: VideoItem) => ({
          ...video,
          isLoaded: false,
        }));
        setVideos(initialVideos);
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
      });
  }, []);

  // Update visible indices when active index changes
  useEffect(() => {
    if (!isLazy) return;

    const start = Math.max(0, activeIndex - BUFFER_SIZE);
    const end = Math.min(videos.length - 1, activeIndex + BUFFER_SIZE);
    const newVisibleIndices = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );

    setVisibleIndices(newVisibleIndices);
    
    // Mark videos as loaded
    setVideos((prevVideos) =>
      prevVideos.map((video, index) => ({
        ...video,
        isLoaded: video.isLoaded || newVisibleIndices.includes(index),
      }))
    );
  }, [activeIndex, videos.length, isLazy]);

  const viewabilityConfig: ViewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 300,
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    },
    []
  );

  const shouldRenderItem = (index: number) => {
    if (!isLazy) return true;
    return visibleIndices.includes(index);
  };

  const renderItem = (
    item: VideoItem,
    index: number,
    scrollX: Animated.Value
  ) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.95, 1, 0.95],
      extrapolate: "clamp",
    });

    if (!shouldRenderItem(index)) {
      return (
        <View style={[dynamicStyles.itemContainer, dynamicStyles.placeholder]} />
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleVideoPress(item)}
        style={dynamicStyles.itemContainer}
      >
        <Animated.View
          style={[dynamicStyles.itemWrapper, { transform: [{ scale }] }]}
        >
          <Image
            source={{ uri: item.thumbnail }}
            style={dynamicStyles.thumbnail}
            resizeMode="cover"
          />
          {showControls && (
            <View style={dynamicStyles.playButton}>
              <View style={dynamicStyles.playIcon} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // ... rest of the component remains the same ...
  const handleVideoPress = (video: VideoItem) => {
    setSelectedVideo(video);
    setModalVisible(true);
    if (onVideoPress) {
      onVideoPress(video);
    }
  };

  const closeModal = () => {
    if (Platform.OS === "ios") {
      if (videoRef.current) {
        videoRef.current.stopAsync();
      }
    }
    setModalVisible(false);
    setSelectedVideo(null);
  };

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const dynamicStyles = createStyles(width, height);

  const renderProgressBar = () => {
    const progressWidth = width / videos.length;
    return (
      <View style={dynamicStyles.progressContainer}>
        {videos.map((_, index) => (
          <View
            key={index}
            style={[
              dynamicStyles.progressBar,
              {
                width: progressWidth - 2,
                backgroundColor: index === activeIndex ? "#FF0000" : "#666",
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderVideoModal = () => {
    if (!selectedVideo) return null;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={dynamicStyles.modalContainer}>
          <StatusBar barStyle="light-content" />
          <TouchableOpacity
            onPress={closeModal}
            style={dynamicStyles.closeButton}
          >
            <Text style={dynamicStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Video
            ref={videoRef}
            source={{ uri: selectedVideo.short_video }}
            style={dynamicStyles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={modalVisible}
            isLooping={false}
            onError={(error: any) => console.error("Video Error:", error)}
          />
          <View style={dynamicStyles.modalInfo}>
            <Text style={dynamicStyles.modalTitle}>{selectedVideo.title}</Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  if (!apiKey) return (
    <View style={dynamicStyles.noapicont}>
      <Text>Please pass value of api key</Text>
    </View>
  );

  return (
    <View style={dynamicStyles.container}>
     <AnimatedFlatList
  ref={flatListRef}
  data={videos}
  renderItem={({ item, index }: any) => renderItem(item, index, scrollX)}
  keyExtractor={(item: any) => item.id}
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  snapToInterval={width}
  decelerationRate="fast"
  viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  )}
  scrollEventThrottle={16}
  initialNumToRender={isLazy ? batchSize : undefined} // Use batchSize here
  maxToRenderPerBatch={isLazy ? batchSize : undefined} // Use batchSize here
  windowSize={isLazy ? batchSize : undefined} // Use batchSize here
/>

      {showControls && renderProgressBar()}
      {renderVideoModal()}
    </View>
  );
};

const createStyles = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      height: height + 4,
    },
    itemContainer: {
      width: width,
      height: height,
    },
    itemWrapper: {
      flex: 1,
      margin: 2,
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: "#000",
    },
    thumbnail: {
      width: "100%",
      height: "100%",
    },
    placeholder: {
      backgroundColor: "#f0f0f0",
      justifyContent: "center",
      alignItems: "center",
    },
    progressContainer: {
      flexDirection: "row",
      justifyContent: "center",
      paddingHorizontal: 2,
      marginTop: 2,
    },
    progressBar: {
      height: 2,
      borderRadius: 1,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "#000",
    },
    video: {
      width: DEFAULT_ITEM_WIDTH,
      height: DEFAULT_ITEM_HEIGHT,
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      color: "#FFF",
      fontSize: 24,
    },
    modalInfo: {
      padding: 16,
    },
    modalTitle: {
      color: "#FFF",
      fontSize: 18,
      fontWeight: "bold",
    },
    playButton: {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: 60,
      height: 60,
      marginLeft: -30,
      marginTop: -30,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
    },
    playIcon: {
      width: 0,
      height: 0,
      marginLeft: 5,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderLeftWidth: 20,
      borderRightWidth: 0,
      borderBottomWidth: 15,
      borderTopWidth: 15,
      borderLeftColor: "white",
      borderRightColor: "transparent",
      borderBottomColor: "transparent",
      borderTopColor: "transparent",
    },
    noapicont: {
      width: width/3,
      height: height/3,
      margin: 2,
      borderRadius: 8,
      backgroundColor: "lightgray",
      justifyContent: 'center',
      alignItems: 'center'
    },
  });