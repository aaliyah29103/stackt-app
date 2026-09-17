type IconProps = {
  className?: string
}

export function FlagIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M2 1C2 0.446875 1.55313 0 1 0C0.446875 0 0 0.446875 0 1V2V11.5V15C0 15.5531 0.446875 16 1 16C1.55313 16 2 15.5531 2 15V11L4.00938 10.4969C5.29375 10.175 6.65313 10.325 7.8375 10.9156C9.21875 11.6062 10.8219 11.6906 12.2656 11.1469L13.35 10.7406C13.7406 10.5938 14 10.2219 14 9.80313V2.06562C14 1.34687 13.2438 0.878125 12.6 1.2L12.3 1.35C10.8531 2.075 9.15 2.075 7.70312 1.35C6.60625 0.8 5.34687 0.6625 4.15625 0.959375L2 1.5V1Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 12 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.7063 4.70625C11.0969 4.31563 11.0969 3.68125 10.7063 3.29063C10.3156 2.9 9.68125 2.9 9.29062 3.29063L6 6.58437L2.70625 3.29375C2.31562 2.90313 1.68125 2.90313 1.29062 3.29375C0.9 3.68438 0.9 4.31875 1.29062 4.70937L4.58437 8L1.29375 11.2937C0.903125 11.6844 0.903125 12.3188 1.29375 12.7094C1.68438 13.1 2.31875 13.1 2.70937 12.7094L6 9.41562L9.29375 12.7062C9.68438 13.0969 10.3188 13.0969 10.7094 12.7062C11.1 12.3156 11.1 11.6813 10.7094 11.2906L7.41562 8L10.7063 4.70625Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8 2.5C8 1.94687 7.55313 1.5 7 1.5C6.44687 1.5 6 1.94687 6 2.5V7H1.5C0.946875 7 0.5 7.44687 0.5 8C0.5 8.55313 0.946875 9 1.5 9H6V13.5C6 14.0531 6.44687 14.5 7 14.5C7.55313 14.5 8 14.0531 8 13.5V9H12.5C13.0531 9 13.5 8.55313 13.5 8C13.5 7.44687 13.0531 7 12.5 7H8V2.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 12 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 1L6 6L11 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function RemoveIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M15.1023 2.65781C15.7099 2.05017 15.7099 1.06337 15.1023 0.45573C14.4946 -0.15191 13.5078 -0.15191 12.9002 0.45573L7.78142 5.57934L2.65781 0.46059C2.05017 -0.147049 1.06337 -0.147049 0.45573 0.46059C-0.15191 1.06823 -0.15191 2.05504 0.45573 2.66267L5.57934 7.78142L0.46059 12.905C-0.147049 13.5127 -0.147049 14.4995 0.46059 15.1071C1.06823 15.7148 2.05504 15.7148 2.66267 15.1071L7.78142 9.9835L12.905 15.1023C13.5127 15.7099 14.4995 15.7099 15.1071 15.1023C15.7148 14.4946 15.7148 13.5078 15.1071 12.9002L9.9835 7.78142L15.1023 2.65781Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function BackArrowIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 17.5 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0.367187 9.11719C-0.121094 9.60547 -0.121094 10.3984 0.367187 10.8867L6.61719 17.1367C7.10547 17.625 7.89844 17.625 8.38672 17.1367C8.875 16.6484 8.875 15.8555 8.38672 15.3672L4.26562 11.25H16.25C16.9414 11.25 17.5 10.6914 17.5 10C17.5 9.30859 16.9414 8.75 16.25 8.75H4.26953L8.38281 4.63281C8.87109 4.14453 8.87109 3.35156 8.38281 2.86328C7.89453 2.375 7.10156 2.375 6.61328 2.86328L0.363281 9.11328L0.367187 9.11719Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 10.5018 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.2814 2.47031C10.5744 2.76328 10.5744 3.23906 10.2814 3.53203L4.28145 9.53203C3.98848 9.825 3.5127 9.825 3.21973 9.53203L0.219727 6.53203C-0.0732422 6.23906 -0.0732422 5.76328 0.219727 5.47031C0.512695 5.17734 0.988477 5.17734 1.28145 5.47031L3.75176 7.93828L9.22207 2.47031C9.51504 2.17734 9.99082 2.17734 10.2838 2.47031H10.2814Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function PlusSmallIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 10.5 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6 1.875C6 1.46016 5.66484 1.125 5.25 1.125C4.83516 1.125 4.5 1.46016 4.5 1.875V5.25H1.125C0.710156 5.25 0.375 5.58516 0.375 6C0.375 6.41484 0.710156 6.75 1.125 6.75H4.5V10.125C4.5 10.5398 4.83516 10.875 5.25 10.875C5.66484 10.875 6 10.5398 6 10.125V6.75H9.375C9.78984 6.75 10.125 6.41484 10.125 6C10.125 5.58516 9.78984 5.25 9.375 5.25H6V1.875Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line
        x1="11.2"
        y1="11.2"
        x2="15"
        y2="15"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M2 4h12M6.5 4V2.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V4M6 7.5v4M10 7.5v4M3.5 4l.7 9.1a1 1 0 0 0 1 .9h5.6a1 1 0 0 0 1-.9L12.5 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11.3 1.3a1.5 1.5 0 0 1 2.12 0l1.28 1.28a1.5 1.5 0 0 1 0 2.12l-8.5 8.5-4 1 1-4 8.1-8.1Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ActivityBadgeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="16" height="16" rx="4" fill="currentColor" />
      <path
        d="M7 3L4 9h2l-1 4 4-6H7l2-4H7Z"
        fill="white"
      />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="1"
        y="2.5"
        width="14"
        height="12"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line
        x1="1"
        y1="6"
        x2="15"
        y2="6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line
        x1="4.5"
        y1="1"
        x2="4.5"
        y2="3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="11.5"
        y1="1"
        x2="11.5"
        y2="3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function AddIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.9688 1.4625C10.9688 0.653554 10.3152 0 9.50625 0C8.6973 0 8.04375 0.653554 8.04375 1.4625V8.04375H1.4625C0.653554 8.04375 0 8.6973 0 9.50625C0 10.3152 0.653554 10.9688 1.4625 10.9688H8.04375V17.55C8.04375 18.359 8.6973 19.0125 9.50625 19.0125C10.3152 19.0125 10.9688 18.359 10.9688 17.55V10.9688H17.55C18.359 10.9688 19.0125 10.3152 19.0125 9.50625C19.0125 8.6973 18.359 8.04375 17.55 8.04375H10.9688V1.4625Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function BookmarkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 14 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M0 1.6875V17.1457C0 17.6168 0.383203 18 0.854297 18C1.03008 18 1.20234 17.9473 1.34648 17.8453L6.75 14.0625L12.1535 17.8453C12.2977 17.9473 12.4699 18 12.6457 18C13.1168 18 13.5 17.6168 13.5 17.1457V1.6875C13.5 0.755859 12.7441 0 11.8125 0H1.6875C0.755859 0 0 0.755859 0 1.6875Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function RaceIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 15.75 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1.10742 0.140625C1.71997 0.140625 2.21484 0.635504 2.21484 1.24805V1.80176L4.60272 1.20652C5.92124 0.877753 7.31245 1.03002 8.53061 1.63911C10.1329 2.44199 12.019 2.44199 13.6213 1.63911L13.9535 1.473C14.6664 1.11308 15.5039 1.63218 15.5039 2.42815V12.1077C15.5039 12.568 15.2167 12.9833 14.7841 13.1459L13.5832 13.5958C11.9844 14.1945 10.2056 14.101 8.67942 13.3397C7.36782 12.6822 5.86587 12.5195 4.44007 12.876L2.21484 13.4297V16.752C2.21484 17.3645 1.71997 17.8594 1.10742 17.8594C0.494879 17.8594 0 17.3645 0 16.752V13.9834V11.6994V2.35547V1.24805C0 0.635504 0.494879 0.140625 1.10742 0.140625ZM2.21484 6.61558L4.42969 6.13454V8.4013L2.21484 8.88234V11.1456L3.90367 10.7234C4.08016 10.6785 4.25319 10.6404 4.42969 10.6093V8.4013L5.7759 8.1106C6.06313 8.04831 6.35384 8.02408 6.64453 8.03793V5.82309C7.11519 5.83693 7.58584 5.91306 8.04265 6.04457L8.85938 6.28335V8.59164L7.41626 8.16597C7.16363 8.0933 6.90408 8.04831 6.64453 8.03447V10.5054C7.39897 10.5712 8.14302 10.7372 8.85938 11.0037V8.59164L9.64496 8.8235C10.1122 8.96193 10.5897 9.04499 11.0742 9.0796V6.85437C10.8043 6.82669 10.5344 6.77477 10.2714 6.69864L8.85938 6.28335V4.13773C8.40949 4.00622 7.96652 3.83318 7.53739 3.61862C7.25361 3.47673 6.95253 3.37637 6.64453 3.31408V5.81962C6.19464 5.80578 5.74475 5.84731 5.30524 5.9442L4.42969 6.13454V3.5321L2.21484 4.08581V6.61558ZM11.0742 11.7582C11.6556 11.8101 12.2474 11.7339 12.8046 11.5229L13.2891 11.3429V8.85811L13.0157 8.9204C12.3789 9.06921 11.7248 9.11766 11.0742 9.07613V11.7547V11.7582ZM13.2891 6.5879V4.13426C12.5657 4.34536 11.8218 4.44918 11.0742 4.44918V6.85437C11.5553 6.90282 12.0432 6.87167 12.5173 6.7644L13.2891 6.58443V6.5879Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10 2L2.5 8.5V18H8V12H12V18H17.5V8.5L10 2Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <line
        x1="2"
        y1="5"
        x2="18"
        y2="5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="10"
        x2="18"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="15"
        x2="18"
        y2="15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="7" cy="5" r="2" fill="currentColor" />
      <circle cx="13" cy="10" r="2" fill="currentColor" />
      <circle cx="9" cy="15" r="2" fill="currentColor" />
    </svg>
  )
}

export function LibraryIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line
        x1="3.5"
        y1="5"
        x2="12.5"
        y2="5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="3.5"
        y1="8"
        x2="12.5"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="3.5"
        y1="11"
        x2="9"
        y2="11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function WarningIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 18 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M9 1.5L17 14.5H1L9 1.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <line
        x1="9"
        y1="6.5"
        x2="9"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="9" cy="12.3" r="0.9" fill="currentColor" />
    </svg>
  )
}

export function QuestionMarkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.5 6C5.5 4.5 6.5 3.5 8 3.5C9.5 3.5 10.5 4.5 10.5 5.75C10.5 7 9.5 7.5 8.75 8C8.2 8.35 8 8.75 8 9.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6.5 9.5L9.5 6.5M6.75 4.25L7.5 3.5C8.60457 2.39543 10.3954 2.39543 11.5 3.5C12.6046 4.60457 12.6046 6.39543 11.5 7.5L10.75 8.25M9.25 11.75L8.5 12.5C7.39543 13.6046 5.60457 13.6046 4.5 12.5C3.39543 11.3954 3.39543 9.60457 4.5 8.5L5.25 7.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
