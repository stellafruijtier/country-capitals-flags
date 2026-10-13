import "./FlagImage.css";

interface Props {
  src: string;
  alt: string;
  size?: "large" | "medium";
}

export function FlagImage({ src, alt, size = "medium" }: Props) {
  return <img src={src} alt={alt} className={`flag-image flag-image--${size}`} draggable={false} />;
}
