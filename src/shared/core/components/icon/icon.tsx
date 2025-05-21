import { Icon as IconUI } from 'books-ui';

interface Props {
  name: string;
  addClass?: string;
  size?: "normal" | "big" | "small";
}

export const Icon: React.FC<Props> = ({ name, addClass, size = 'normal' }) => (
  <IconUI size={size}>
    <svg
      {...(addClass && { className: addClass })}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink">
      <use xlinkHref={`./__spritemap#icon-${name}`} />
    </svg>
  </IconUI>
);
