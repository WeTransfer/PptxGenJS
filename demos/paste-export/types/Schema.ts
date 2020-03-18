/* eslint-disable @typescript-eslint/no-namespace */

export interface NestedUser {
  id: UserId;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl?: string | null;
  profileImageIsDefault?: boolean;
}

/* eslint-disable @typescript-eslint/no-namespace */

export type AccessLevel = 'PublicRead' | 'TeamReadWrite' | 'TeamUnlistedReadWrite';
export type Asset = ImageAsset | OEmbedAsset | VideoAsset | FileAsset | PlaceholderAsset;
/**
 * Palette of semantic colors that can be used to style a slide
 */
export interface AssetColorPalette {
  /**
   * Common color of the color palette
   */
  common: string | null;
  /**
   * Background color of the color palette
   */
  background: string | null;
  /**
   * Separate background color for thumbnails, because thumbnail colors shift
   */
  thumbnailBackground: string | null;
  /**
   * True if background color is light, false if dark
   */
  isLight: boolean | null;
  /**
   * Text color of the color palette
   */
  text: string | null;
  /**
   * Shadow color of the image
   */
  shadow: string | null;
}
export type AssetDefaultPosition = 'Right' | 'Left';
export interface AssetDefaultPositionCustomization {
  type: 'AssetDefaultPosition';
  /**
   * Default position for assets added to slide
   */
  position: AssetDefaultPosition;
}
export type AssetFrame =
  | AssetFrameNone
  | AssetFrameFill
  | AssetFrameRounded
  | AssetFramePhone
  | AssetFramePhoneX
  | AssetFrameTablet
  | AssetFrameWindow
  | AssetFrameLaptop
  | AssetFrameDesktop;
export interface AssetFrameDesktop {
  type: 'Desktop';
}
export interface AssetFrameFill {
  type: 'Fill';
}
export interface AssetFrameLaptop {
  type: 'Laptop';
}
export interface AssetFrameNone {
  type: 'None';
}
export interface AssetFramePhone {
  type: 'Phone';
}
export interface AssetFramePhoneX {
  type: 'PhoneX';
}
/**
 * Frame property that corresponds to hasShadow = true (rounded corners)
 */
export interface AssetFrameRounded {
  type: 'Rounded';
}
export interface AssetFrameTablet {
  type: 'Tablet';
}
export type AssetFrameType =
  | 'None'
  | 'Fill'
  | 'Shadow'
  | 'Rounded'
  | 'Phone'
  | 'PhoneX'
  | 'Tablet'
  | 'Window'
  | 'Laptop'
  | 'Desktop';
export interface AssetFrameWindow {
  type: 'Window';
}
export type AssetLocalId = string;
/**
 * Common metadata shared by all assets
 */
export interface AssetMetadata {
  /**
   * Optional color palette extracted from the asset's imagery (if available)
   */
  colorPalette: AssetColorPalette | null;
  /**
   * Scaling applied to the asset in the layout
   */
  layoutScale: number;
  /**
   * Unique (within its presentation) identifier for the asset
   */
  assetLocalId: AssetLocalId;
  /**
   * Timestamp when asset was uploaded
   */
  timestamp?: number;
  /**
   * image transformations
   */
  transforms?: AssetTransforms;
}
/**
 * Allowable angles for image transformation rotation
 */
export type AssetRotationDegrees = 0 | 90 | 180 | 270;
/**
 * Store user-applied transforms
 */
export type AssetTransforms = {
  crop?: Crop;
  rotation?: AssetRotationDegrees;
};
export type AssetType = 'Image' | 'OEmbed' | 'Video' | 'File' | 'Placeholder';
export interface Assignment {
  /**
   * Id of user who assigned this slide
   */
  assignerId: string;
  /**
   * Id of user who is assigned this slide
   */
  assignee: UserReference;
  /**
   * ISO time of assignment
   */
  assignedAt: string;
}
export interface Attribution {
  /**
   * Id of the creator
   */
  creatorId: string | null;
  createdAt: ISOUTCDate;
  /**
   * Map of editors `[id]: [lastEditAt]` of the slide
   */
  editors: {
    [name: string]: any;
  };
}
export type BlobId = string;
/**
 * Image stored in our original blob store
 */
export interface BlobImageContent {
  type: 'Blob';
  /**
   * Hash-based ID of the image blob
   */
  blobId: BlobId;
  /**
   * Size in pixels of the image
   */
  size: Size;
}
export interface Comment {
  author: UserId | SlackUserId | null;
  content: string;
  createdAt: ISOUTCDate | null;
  user?: NestedUser;
}

export interface Container {
  slug: string;
  layoutOptions: LayoutOptions;
  childContainer: Container | null;
  contentBlocks: ContentBlock[];
}

export interface LayoutOptions {
  x: number | 'center';
  y: number | 'center';
  width: number | null;
  height: number | null;
}

export interface DisplayOptions {
  hasShadow?: boolean;
  has3DEffect?: boolean;
  opacity?: number;
}

export const enum TextOptionsAlign {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
  Center = 'center',
}

export interface TextOptions {
  align: TextOptionsAlign.Left | TextOptionsAlign.Right | TextOptionsAlign.Center;
  valign: TextOptionsAlign.Top | TextOptionsAlign.Bottom | TextOptionsAlign.Center;
  color?: string | null;
}

export interface TextContentBlock {
  type: 'Text';
  slug?: string;
  displayOptions?: DisplayOptions;
  layoutOptions: LayoutOptions;
  textOptions: TextOptions;
  textBody: SlideBody | null;
}

export interface AssetContentBlock {
  layoutOptions: LayoutOptions;
  slug?: string;
  content?: Asset;
  type:
    | 'Image'
    | 'OEmbed'
    | 'Video'
    | 'File'
    | 'Placeholder'
    | 'Uploading'
    | 'AssetFramePlaceholder';
}

export type ContentBlock = AssetContentBlock | TextContentBlock;

type DeckColorsTypeUserDefined = 'user-defined';
export type DeckColorsType = DeckColorsTypeUserDefined;
export interface DeckColorInfo {
  type: DeckColorsType;
  colors: string[];
}
/**
 * User created crop area dimensions
 */
export interface Crop {
  x: number;
  y: number;
  width: number;
  height: number;
}
export type DeckCustomization = AssetDefaultPositionCustomization | IntroModeAutoColorCustomization;
export type DeckUUID = string;
export type PresentationGroupId = number | undefined | null;
export interface DrawLayer {
  /**
   * List of strokes drawn on this slide
   */
  strokes: Stroke[];
}
declare namespace DrawLayer {
  namespace Definitions {
    export type StrokeType = 'Pen1' | 'Highlighter1' | 'Eraser1' | 'FountainPen1';
  }
}
export type EmailReference = {
  type: 'Email';
  /**
   * TODO: Figure out how to use `email` type.
   */
  email: string;
};
/**
 * Asset created from a file not natively renderable in the browser
 */
export interface FileAsset {
  type: 'File';
  metadata: AssetMetadata;
  /**
   * Contents of the file
   */
  content: FileContent;
}
export type FileContent = GenericFileContent | ViewableFileContent;
export type FilestackBlobId = string;
export type FilestackHandle = string;
/**
 * Image stored in Filestack
 */
export interface FilestackImageContent {
  type: 'Filestack';
  metadata: FilestackMetadata;
  /**
   * width and height of the image
   */
  size: Size;
}
/**
 * Metadata associated with a file stored in Filestack
 */
export interface FilestackMetadata {
  /**
   * Unique blob ID, parsed from the key, used to identify a file to the blob store
   */
  blobId: FilestackBlobId;
  /**
   * Unique handle, parsed from the URL, used to identify a file to the Filestack API
   */
  handle: FilestackHandle;
  /**
   * URL of the file in Filestack's CDN
   */
  url: string;
  /**
   * Path of the file in S3
   */
  key: string;
  /**
   * Name of the original file
   */
  filename: string;
  /**
   * MIME type of the original file
   */
  mimetype: string;
  /**
   * Size in bytes of the original file
   */
  size: number;
}
/**
 * Video stored in Filestack
 */
export interface FilestackVideoContent {
  type: 'Filestack';
  /**
   * Metadata for the video file
   */
  metadata: FilestackMetadata;
  /**
   * Size in pixels of the video file
   */
  size: Size;
}
/**
 * File rendered as a generic attachment placeholder
 */
export interface GenericFileContent {
  type: 'Generic';
  metadata: FilestackMetadata;
}
/**
 * ISO formatted date string
 */
export type ISOUTCDate = string | null;
/**
 * Asset created from an uploaded image
 */
export interface ImageAsset {
  type: 'Image';
  metadata: AssetMetadata;
  /**
   * Image representation
   */
  content: ImageContent;
  imageContent?: ImageContent;
  originalContent?: ImageContent; // original asset content before any image transformations
}
export type ImageContent =
  | BlobImageContent
  | URLImageContent
  | FilestackImageContent
  | PreviewImageContent;
export type IntroModeAutoColor = 'Black' | 'Auto';
export interface IntroModeAutoColorCustomization {
  type: 'IntroModeAutoColor';
  /**
   * Color used for auto color in Intro mode
   */
  color: IntroModeAutoColor;
}
export type LayoutCustomization =
  | LayoutModeCustomization
  | LayoutModeAutoCustomization
  | TextAssetPositionCustomization;
export type LayoutCustomizationType = 'TextAssetPosition' | 'LayoutMode' | 'LayoutModeAuto';
export type LayoutMode = 'Show' | 'Tell' | 'Intro';
export type LayoutModeAuto = 'Show' | 'Tell';
export interface LayoutModeAutoCustomization {
  type: 'LayoutModeAuto';
  /**
   * Automatically determined layout mode of the slide
   */
  mode: LayoutModeAuto;
}
export interface LayoutModeCustomization {
  type: 'LayoutMode';
  /**
   * User selected layout mode of the slide
   */
  mode: LayoutMode;
}
/**
 * Asset created from an oEmbed response
 */
export interface OEmbedAsset {
  type: 'OEmbed';
  metadata?: AssetMetadata;
  /**
   * URL from which the oEmbed response was generated
   */
  sourceURL?: string;
  /**
   * TODORT: backend handles embedly stuff, this should be removed
   * Contents of the oEmbed response
   */
  content?: OEmbedContent | null;
  /**
   * URL that will be used to fetch embedded content
   */
  url?: string;
}
export type OEmbedContent =
  | OEmbedPhotoContent
  | OEmbedVideoContent
  | OEmbedRichContent
  | OEmbedLinkContent;
/**
 * Content represented by a `link` oEmbed response
 */
export interface OEmbedLinkContent {
  type: 'Link';
  metadata: OEmbedMetadata;
}
/**
 * Common metadata shared by all oEmbed responses
 */
export interface OEmbedMetadata {
  title: string | null;
  author: string | null;
  provider: string | null;
  description: string | null;
  /**
   * Optional thumbnail representation of the content
   */
  thumbnail: ImageContent | null;
}
/**
 * Content represented by a `photo` oEmbed response
 */
export interface OEmbedPhotoContent {
  type: 'Photo';
  photo: ImageContent;
  metadata: OEmbedMetadata;
  originalContent?: ImageContent; // original asset content before any image transformations
}
/**
 * Content represented by a `rich` oEmbed response
 */
export interface OEmbedRichContent {
  type: 'Rich';
  /**
   * Raw rich content HTML
   */
  html: string;
  /**
   * Optional size to display the rich content HTML
   */
  size: Size | null;
  metadata: OEmbedMetadata;
}
/**
 * Content represented by a `video` oEmbed response
 */
export interface OEmbedVideoContent {
  type: 'Video';
  /**
   * Raw video content HTML
   */
  html: string;
  /**
   * Optional size to display the video content HTML
   */
  size: Size | null;
  metadata: OEmbedMetadata;
}
/**
 * Placeholder asset while image is being uploaded in a multi-column layout
 */
export interface PlaceholderAsset {
  type: 'Placeholder';
  metadata: AssetMetadata;
  /**
   * extra logging information to debug disappearing asset bugs
   */
  logging?: {
    /**
     * asset filename or URL
     */
    assetFileName?: string | null;
    /**
     * asset file size for local files
     */
    localFileSize?: number;
    /**
     * last recorded upload progress
     */
    lastProgress?: number;
    /**
     * userID of user who added asset
     */
    userId?: UserId;
  };
}

/**
 * Represents a deck
 */
export interface Deck {
  /*
    The aim with this interface is to move out properties from the snapshot like
    uuid/lastEditedAt and put them here, the just leave heavier properties such
    as slides in the snapshot.

    For right now that refactoring will have to wait.
    */

  /**
   * Contains heavier information such as the complete list of slides
   */
  snapshot: PresentationSnapshot;
  groupId: PresentationGroupId;
}

/**
 * Describes a deck snapshot. For historical reasons the whole deck used to just
 * be stored in one column in the DB, but slowly properties have been extracted
 * in to their own columns, in theory this shouldn't exist but it does.
 */
export interface PresentationSnapshot {
  /**
   * Unique identifier for the deck
   */
  uuid: DeckUUID;
  /**
   * Unique identifier of the source deck this one was duplicated from; `null` if this is the original
   */
  sourceUUID: DeckUUID | null;
  /**
   * Indicates whether the deck was automatically generated by Paste or not
   */
  isAutoGenerated: boolean;
  /**
   * ID of the user who created this deck
   */
  creatorId: UserId | null;
  /**
   * Title of the deck
   */
  title: string;
  /**
   * Team alias
   */
  teamAlias: TeamAlias | null;
  /**
   * ISO time of last edit in this deck
   */
  lastEditedAt: string | null;
  /**
   * List of slides that make up the deck
   */
  slides: Slide[];
  /**
   * Audit trail for version upgrades
   */
  upgradeHistory: UpgradeHistory[];
  /**
   * Viewers who have seen this deck
   */
  viewers: Viewer[];
  /**
   * Access level a user has to this deck
   */
  accessLevel: AccessLevel;
  /**
   * The Slack channel ID associated with this deck
   */
  slackChannelId: SlackChannelId | null;
  /**
   * List of customizations for the deck
   */
  customizations?: DeckCustomization[];
  /**
   * The Group ID associated with this deck
   */
  groupId: number | null;
  /**
   * The view token associated with this deck
   */
  viewToken: string | null;
  /**
   * The view token associated with this deck
   */
  colorInfo?: DeckColorInfo | null;
}
/**
 * Prevew image stored locally until image has been uploaded
 */
export interface PreviewImageContent {
  type: 'Preview';
  url: string | undefined;
  /**
   * Size in pixels of the image
   */
  size: Size;
}
export interface Reaction {
  /**
   * name of reaction
   */
  name: ReactionName;
  /**
   * ID of the user who reacted
   */
  reactorId: UserId;
  /**
   * ISO time of reaction
   */
  reactedAt: string;

  user?: NestedUser;
}
export type ReactionName =
  | 'ThumbsUp'
  | 'ThumbsDown'
  | 'Smile'
  | 'Star'
  | 'Heart'
  | 'Clap'
  | 'Flag'
  | 'Check';
export interface Size {
  width: number;
  height: number;
}
export type SlackChannelId = string;
export type SlackChannelReference = {
  type: 'SlackChannel';
  id: SlackChannelId;
};
export type SlackTimestamp = string;
export type SlackUserId = string;
export interface Slide {
  /**
   * Unique (within its presentation) identifier for the slide
   */
  localId: SlideLocalId;
  /**
   * Title of the slide
   */
  title: string;
  /**
   * Main body content of the slide
   */
  body: SlideBody;
  /**
   * List of assets attached to the slide
   */
  assets: Asset[];
  /**
   * List of customizations for the slide
   */
  layoutCustomizations: LayoutCustomization[];
  /**
   * Attribution for the slide
   */
  attribution: Attribution;
  /**
   * Assignment for the slide
   */
  assignment?: Assignment;
  /**
   * Drawing on this slide
   */
  drawLayer?: DrawLayer;
  /**
   * List of reactions attached to the slide
   */
  reactions: Reaction[];
  /**
   * List of comments attached to the slide
   */
  comments: Comment[];
  /**
   * Background color of the slide
   */
  backgroundColor: string | null;
  /**
   * `true` if slide has asset shadows, `false` otherwise
   */
  hasShadow: boolean;
  /**
   * asset frame around asset
   */
  assetFrame?: AssetFrame;
  /**
   * optional prop allows user to override default 3D effect
   */
  has3DEffect?: boolean;
  /**
   * Text color of the slide
   */
  textColor: string | null;

  /**
   * Slide containers
   */
  containers?: Container[];
}
export type SlideBody = any;
export type SlideCustomizationType = 'AssetDefaultPosition' | 'IntroModeAutoColor';
export type SlideLocalId = string;
export interface Stroke {
  /**
   * Id for this stroke (unique in strokes array; cannot 'index' because indexes can transform); `strokes` cannot be a dictionary because order still matters
   */
  id: string;
  /**
   * Canvas X coordinates for this stroke.
   */
  x: number[];
  /**
   * Canvas Y coordinates for this stroke.
   */
  y: number[];
  strokeType: 'Pen1' | 'Highlighter1' | 'Eraser1' | 'FountainPen1';
}
export type TeamAlias = string;
export type TextAssetPosition = 'MediaTop' | 'MediaBottom' | 'MediaLeft' | 'MediaRight';
export interface TextAssetPositionCustomization {
  type: 'TextAssetPosition';
  /**
   * Position of asset with respect to text
   */
  position: TextAssetPosition;
}
/**
 * Image at a URL
 */
export interface URLImageContent {
  type: 'URL';
  url: string;
  /**
   * Size in pixels of the linked image
   */
  size: Size;
}
export interface UpgradeHistory {
  /**
   * Version before upgrade
   */
  fromVersion: Version;
  /**
   * Version after upgrade
   */
  toVersion: Version;
  date: string;
}
export type UserId = string;
export type UserReference =
  | {
      type: 'User';
      id: UserId;
    }
  | {
      type: 'SlackUser';
      id: SlackUserId;
    };
export interface Version {
  /**
   * Major version number
   */
  major: number;
  /**
   * Minor version number
   */
  minor: number;
}
/**
 * Asset created from an uploaded video
 */
export interface VideoAsset {
  type: 'Video';
  metadata: AssetMetadata;
  /**
   * Original uploaded video file
   */
  content: GenericFileContent;
  /**
   * Completed transcodings for the video content
   */
  transcodings: VideoTranscoding[];
  /**
   * Thumbnail image for the video content
   */
  thumbnail: ImageContent | null;
}
export type VideoContent = FilestackVideoContent;
export type VideoFormat = 'h264.hi';
/**
 * Transcoded version of the original video content
 */
export interface VideoTranscoding {
  /**
   * Video format of the transcoded video file
   */
  format: VideoFormat;
  /**
   * Transcoded video content
   */
  content: FilestackVideoContent;
}
/**
 * File rendered using the Filestack Viewer
 */
export interface ViewableFileContent {
  type: 'Viewable';
  metadata: FilestackMetadata;
  /**
   * Thumbnail image for the file
   */
  thumbnail: ImageContent | null;
}
export interface Viewer {
  userId: UserId;
  /**
   * ISO time of the last time user viewed this deck
   */
  date: string;
}
