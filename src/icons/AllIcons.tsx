import React from "react";

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.75 4.75C12.75 4.33579 12.4142 4 12 4C11.5858 4 11.25 4.33579 11.25 4.75V11.25H4.75C4.33579 11.25 4 11.5858 4 12C4 12.4142 4.33579 12.75 4.75 12.75H11.25V19.25C11.25 19.6642 11.5858 20 12 20C12.4142 20 12.75 19.6642 12.75 19.25V12.75H19.25C19.6642 12.75 20 12.4142 20 12C20 11.5858 19.6642 11.25 19.25 11.25H12.75V4.75Z"
      fill="currentColor"
    />
  </svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
      fill="currentColor"
    />
  </svg>
);

export const BoxIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.5 6.5C4.5 5.39543 5.39543 4.5 6.5 4.5H17.5C18.6046 4.5 19.5 5.39543 19.5 6.5V17.5C19.5 18.6046 18.6046 19.5 17.5 19.5H6.5C5.39543 19.5 4.5 18.6046 4.5 17.5V6.5ZM6.5 3C4.567 3 3 4.567 3 6.5V17.5C3 19.433 4.567 21 6.5 21H17.5C19.433 21 21 19.433 21 17.5V6.5C21 4.567 19.433 3 17.5 3H6.5Z"
      fill="currentColor"
    />
  </svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM10.4785 15.4985L16.4985 9.47852L15.5215 8.50146L10.4785 13.5445L8.47852 11.5445L7.50146 12.5215L10.4785 15.4985Z"
      fill="currentColor"
    />
  </svg>
);

export const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 16C11.4477 16 11 15.5523 11 15V14C11 13.4477 11.4477 13 12 13C12.5523 13 13 13.4477 13 14V15C13 15.5523 12.5523 16 12 16ZM12 11C11.4477 11 11 10.5523 11 10V8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8V10C13 10.5523 12.5523 11 12 11Z"
      fill="currentColor"
    />
  </svg>
);

export const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 16C11.4477 16 11 15.5523 11 15V11C11 10.4477 11.4477 10 12 10C12.5523 10 13 10.4477 13 11V15C13 15.5523 12.5523 16 12 16ZM12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9Z"
      fill="currentColor"
    />
  </svg>
);

export const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM8.21967 8.21967C7.92678 7.92678 7.4519 7.92678 7.15901 8.21967C6.86612 8.51256 6.86612 8.98744 7.15901 9.28033L10.8787 13L7.15901 16.7197C6.86612 17.0126 6.86612 17.4874 7.15901 17.7803C7.4519 18.0732 7.92678 18.0732 8.21967 17.7803L12 14.0006L15.7803 17.7803C16.0732 18.0732 16.5481 18.0732 16.841 17.7803C17.1339 17.0126 17.1339 16.5377 16.841 16.2448L13.1213 12.5251L16.841 8.78033C17.1339 8.48744 17.1339 8.01256 16.841 7.71967C16.5481 7.42678 16.0732 7.42678 15.7803 7.71967L12 11.5L8.21967 8.21967Z"
      fill="currentColor"
    />
  </svg>
);

export const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11 2C10.4477 2 10 2.44772 10 3V11H6C5.44772 11 5 11.4477 5 12C5 12.5523 5.44772 13 6 13H10V21C10 21.5523 10.4477 22 11 22H13C13.5523 22 14 21.5523 14 21V13H18C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11H14V3C14 2.44772 13.5523 2 13 2H11Z"
      fill="currentColor"
    />
  </svg>
);

export const ArrowUpIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C12.5523 4 13 4.44772 13 5V19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19V5C11 4.44772 11.4477 4 12 4Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4L16 8L15.2929 8.70711L12 5.41421L8.70711 8.70711L8 8L12 4Z"
      fill="currentColor"
    />
  </svg>
);

export const ArrowDownIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 20C11.4477 20 11 19.5523 11 19V5C11 4.44772 11.4477 4 12 4C12.5523 4 13 4.44772 13 5V19C13 19.5523 12.5523 20 12 20Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 20L8 16L8.70711 15.2929L12 18.5858L15.2929 15.2929L16 16L12 20Z"
      fill="currentColor"
    />
  </svg>
);

export const FolderIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 6C2 4.89543 2.89543 4 4 4H9L11 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6ZM4 6H9L11 8H20V18H4V6Z"
      fill="currentColor"
    />
  </svg>
);

export const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6ZM5 6H19V18H5V6Z"
      fill="currentColor"
    />
    <path
      d="M10 9L14 12L10 15V9Z"
      fill="currentColor"
    />
  </svg>
);

export const AudioIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6ZM5 6H19V18H5V6Z"
      fill="currentColor"
    />
    <path
      d="M8 10H9V14H8V10Z"
      fill="currentColor"
    />
    <path
      d="M11 10H12V14H11V10Z"
      fill="currentColor"
    />
    <path
      d="M14 10H15V14H14V10Z"
      fill="currentColor"
    />
  </svg>
);

export const GridIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 3C3 2.44772 3.44772 2 4 2H10C10.5523 2 11 2.44772 11 3V10C11 10.5523 10.5523 11 10 11H4C3.44772 11 3 10.5523 3 10V3ZM4 3H10V10H4V3Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 3C13 2.44772 13.4477 2 14 2H20C20.5523 2 21 2.44772 21 3V10C21 10.5523 20.5523 11 20 11H14C13.4477 11 13 10.5523 13 10V3ZM14 3H20V10H14V3Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3 13C3 12.4477 3.44772 12 4 12H10C10.5523 12 11 12.4477 11 13V20C11 20.5523 10.5523 21 10 21H4C3.44772 21 3 20.5523 3 20V13ZM4 13H10V20H4V13Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 13C13 12.4477 13.4477 12 14 12H20C20.5523 12 21 12.4477 21 13V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V13ZM14 13H20V20H14V13Z"
      fill="currentColor"
    />
  </svg>
);

export const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 2C3.44772 2 3 2.44772 3 3V21C3 21.5523 3.44772 22 4 22H20C20.5523 22 21 21.5523 21 21V7L15 2H4ZM4 3H14V8H20V21H4V3ZM15 3.41421L19.5858 8H15V3.41421Z"
      fill="currentColor"
    />
  </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C12.5523 4 13 4.44772 13 5V15C13 15.5523 12.5523 16 12 16C11.4477 16 11 15.5523 11 15V5C11 4.44772 11.4477 4 12 4Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 16L16 12L15.2929 11.2929L12 14.5858L8.70711 11.2929L8 12L12 16Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 18C20 17.4477 19.5523 17 19 17H5C4.44772 17 4 17.4477 4 18C4 18.5523 4.44772 19 5 19H19C19.5523 19 20 18.5523 20 18Z"
      fill="currentColor"
    />
  </svg>
);

export const ArrowRightIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 12C4 11.4477 4.44772 11 5 11H19C19.5523 11 20 11.4477 20 12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20 12L16 8L15.2929 8.70711L18.5858 12L15.2929 15.2929L16 16L20 12Z"
      fill="currentColor"
    />
  </svg>
);

export const GroupIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z"
      fill="currentColor"
    />
    <path
      d="M12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6Z"
      fill="currentColor"
    />
    <path
      d="M12 14C9.79086 14 8 15.7909 8 18H16C16 15.7909 14.2091 14 12 14Z"
      fill="currentColor"
    />
  </svg>
);

export const BoxIconLine: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6ZM4 6H20V18H4V6Z"
      fill="currentColor"
    />
  </svg>
);

export const ShootingStarIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
      fill="currentColor"
    />
  </svg>
);

export const DollarLineIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z"
      fill="currentColor"
    />
    <path
      d="M12 6C10.3431 6 9 7.34315 9 9H11C11 8.44772 11.4477 8 12 8C12.5523 8 13 8.44772 13 9C13 9.55228 12.5523 10 12 10H10C9.44772 10 9 10.4477 9 11V13C9 13.5523 9.44772 14 10 14H12C13.6569 14 15 12.6569 15 11C15 9.34315 13.6569 8 12 8C10.3431 8 9 9.34315 9 11"
      fill="currentColor"
    />
  </svg>
);

export const TrashBinIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17 5V4C17 2.89543 16.1046 2 15 2H9C7.89543 2 7 2.89543 7 4V5H4C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H5V19C5 20.6569 6.34315 22 8 22H16C17.6569 22 19 20.6569 19 19V7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H17ZM9 4H15V5H9V4ZM17 7H7V19C7 19.5523 7.44772 20 8 20H16C16.5523 20 17 19.5523 17 19V7Z"
      fill="currentColor"
    />
  </svg>
);

export const AngleUpIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 8L18 14L16.59 15.41L12 10.83L7.41 15.41L6 14L12 8Z"
      fill="currentColor"
    />
  </svg>
);

export const AngleDownIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 16L6 10L7.41 8.59L12 13.17L16.59 8.59L18 10L12 16Z"
      fill="currentColor"
    />
  </svg>
);

export const AngleLeftIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41L14 6Z"
      fill="currentColor"
    />
  </svg>
);

export const AngleRightIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59L10 18Z"
      fill="currentColor"
    />
  </svg>
);

export const PencilIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 4.5L19.5 10L9 20.5L3.5 15L14 4.5Z"
      fill="currentColor"
    />
    <path
      d="M13 6L18 11L16.5 12.5L11.5 7.5L13 6Z"
      fill="currentColor"
    />
  </svg>
);

export const CheckLineIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
      fill="currentColor"
    />
  </svg>
);

export const CloseLineIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
      fill="currentColor"
    />
  </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z"
      fill="currentColor"
    />
  </svg>
);

export const ChevronUpIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.41 15.41L12 10.83L16.59 15.41L18 14L12 8L6 14L7.41 15.41Z"
      fill="currentColor"
    />
  </svg>
);

export const PaperPlaneIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
      fill="currentColor"
    />
  </svg>
);

export const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 8H17V6C17 3.23858 14.7614 1 12 1C9.23858 1 7 3.23858 7 6V8H6C4.89543 8 4 8.89543 4 10V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V10C20 8.89543 19.1046 8 18 8ZM9 6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V8H9V6ZM18 10H6V20H18V10Z"
      fill="currentColor"
    />
  </svg>
);

export const EnvelopeIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6ZM4 6L12 11L20 6H4ZM4 18H20V8L12 13L4 8V18Z"
      fill="currentColor"
    />
  </svg>
);

export const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z"
      fill="currentColor"
    />
    <path
      d="M12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6Z"
      fill="currentColor"
    />
    <path
      d="M12 14C9.79086 14 8 15.7909 8 18H16C16 15.7909 14.2091 14 12 14Z"
      fill="currentColor"
    />
  </svg>
);

export const CalenderIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 2C8.55228 2 9 2.44772 9 3V4H15V3C15 2.44772 15.4477 2 16 2C16.5523 2 17 2.44772 17 3V4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4H7V3C7 2.44772 7.44772 2 8 2ZM5 6H19V20H5V6Z"
      fill="currentColor"
    />
  </svg>
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 4C7 4 2.73 7.11 1 11.5C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 11.5C21.27 7.11 17 4 12 4ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16Z"
      fill="currentColor"
    />
  </svg>
);

export const EyeCloseIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4C7 4 2.73 7.11 1 11.5C2.73 15.89 7 19 12 19C17 19 21.27 15.89 23 11.5C21.27 7.11 17 4 12 4ZM12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16Z"
      fill="currentColor"
    />
    <path
      d="M2 2L22 22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const TimeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z"
      fill="currentColor"
    />
    <path
      d="M12 7V12H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 2H8C6.89543 2 6 2.89543 6 4V16C6 17.1046 6.89543 18 8 18H16C17.1046 18 18 17.1046 18 16V4C18 2.89543 17.1046 2 16 2ZM8 4H16V16H8V4Z"
      fill="currentColor"
    />
    <path
      d="M4 6H2V20C2 21.1046 2.89543 22 4 22H18V20H4V6Z"
      fill="currentColor"
    />
  </svg>
);

export const ChevronLeftIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z"
      fill="currentColor"
    />
  </svg>
);

export const UserCircleIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z"
      fill="currentColor"
    />
    <path
      d="M12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6Z"
      fill="currentColor"
    />
    <path
      d="M12 14C9.79086 14 8 15.7909 8 18H16C16 15.7909 14.2091 14 12 14Z"
      fill="currentColor"
    />
  </svg>
);

export const TaskIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 2C3.44772 2 3 2.44772 3 3V21C3 21.5523 3.44772 22 4 22H20C20.5523 22 21 21.5523 21 21V3C21 2.44772 20.5523 2 20 2H4ZM4 3H20V21H4V3Z"
      fill="currentColor"
    />
    <path
      d="M9 8H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 12H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M9 16H12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const ListIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 13H5V11H3V13ZM3 17H5V15H3V17ZM3 9H5V7H3V9ZM7 13H21V11H7V13ZM7 17H21V15H7V17ZM7 7V9H21V7H7Z"
      fill="currentColor"
    />
  </svg>
);

export const TableIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 2C3.44772 2 3 2.44772 3 3V21C3 21.5523 3.44772 22 4 22H20C20.5523 22 21 21.5523 21 21V3C21 2.44772 20.5523 2 20 2H4ZM4 3H20V21H4V3Z"
      fill="currentColor"
    />
    <path
      d="M3 8H21"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M9 8V22"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

export const PageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 2C3.44772 2 3 2.44772 3 3V21C3 21.5523 3.44772 22 4 22H20C20.5523 22 21 21.5523 21 21V3C21 2.44772 20.5523 2 20 2H4ZM4 3H20V21H4V3Z"
      fill="currentColor"
    />
  </svg>
);

export const PieChartIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 12V4C15.97 4 20 8.03 20 13H12C11.45 13 11 12.55 11 12Z"
      fill="currentColor"
    />
  </svg>
);

export const BoxCubeIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.47 21.88C12.19 22.04 11.81 22.04 11.53 21.88L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.53 2.12C11.81 1.96 12.19 1.96 12.47 2.12L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5ZM12 4.15L5 8.09V15.91L12 19.85L19 15.91V8.09L12 4.15Z"
      fill="currentColor"
    />
  </svg>
);

export const PlugInIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 2V8H15V11H13V13H11V11H9V8H11V2H13Z"
      fill="currentColor"
    />
    <path
      d="M5 15V13H3V11H5V9H8V11H10V13H8V15H5Z"
      fill="currentColor"
    />
    <path
      d="M16 15V13H14V11H16V9H19V11H21V13H19V15H16Z"
      fill="currentColor"
    />
    <path
      d="M13 15V18H11V22H13V18H15V15H13Z"
      fill="currentColor"
    />
  </svg>
);

export const DocsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 2C3.44772 2 3 2.44772 3 3V21C3 21.5523 3.44772 22 4 22H20C20.5523 22 21 21.5523 21 21V3C21 2.44772 20.5523 2 20 2H4ZM4 3H20V21H4V3Z"
      fill="currentColor"
    />
    <path
      d="M7 7H17V9H7V7Z"
      fill="currentColor"
    />
    <path
      d="M7 11H17V13H7V11Z"
      fill="currentColor"
    />
    <path
      d="M7 15H14V17H7V15Z"
      fill="currentColor"
    />
  </svg>
);

export const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6ZM4 6L12 11L20 6H4ZM4 18H20V8L12 13L4 8V18Z"
      fill="currentColor"
    />
  </svg>
);

export const HorizontaLDots: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="2"
      fill="currentColor"
    />
    <circle
      cx="19"
      cy="12"
      r="2"
      fill="currentColor"
    />
    <circle
      cx="5"
      cy="12"
      r="2"
      fill="currentColor"
    />
  </svg>
);

export const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 2C2 1.44772 2.44772 1 3 1H21C21.5523 1 22 1.44772 22 2V17C22 17.5523 21.5523 18 21 18H8L2 22V2ZM4 3V18.2361L8.44721 16H20V3H4Z"
      fill="currentColor"
    />
  </svg>
);

export const MoreDotIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="2"
      transform="rotate(90 12 12)"
      fill="currentColor"
    />
    <circle
      cx="19"
      cy="12"
      r="2"
      transform="rotate(90 19 12)"
      fill="currentColor"
    />
    <circle
      cx="5"
      cy="12"
      r="2"
      transform="rotate(90 5 12)"
      fill="currentColor"
    />
  </svg>
);

export const AlertHexaIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
      fill="currentColor"
    />
    <path
      d="M11 7H13V13H11V7Z"
      fill="white"
    />
    <path
      d="M11 15H13V17H11V15Z"
      fill="white"
    />
  </svg>
);

export const ErrorHexaIcon: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
      fill="currentColor"
    />
    <path
      d="M11 7H13V13H11V7Z"
      fill="white"
    />
    <path
      d="M11 15H13V17H11V15Z"
      fill="white"
    />
  </svg>
);
