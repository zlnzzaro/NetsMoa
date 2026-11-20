// 선으로 그린 작은 아이콘. 사용법: <Icon name="search" />
const PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  left: <path d="M19 12H5M11 6l-6 6 6 6" />,
  right: <path d="M5 12h14M13 6l6 6-6 6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
}

export default function Icon({ name, size }) {
  return (
    <svg className="i" viewBox="0 0 24 24" aria-hidden="true" style={size ? { width: size, height: size } : undefined}>
      {PATHS[name]}
    </svg>
  )
}
