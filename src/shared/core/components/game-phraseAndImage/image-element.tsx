import { Button, Image } from 'books-ui';

import { usePhraseAndImageContext } from '@/shared/core/components/game-phraseAndImage/game-phrase-context';

import css from './phrase-and-image.module.css';
type ImgType = {
  id: number;
  join: number;
  url: string;
  alt: string;
};
export const ImageElement: React.FC<ImgType> = ({ id, join, url, alt, ...props }) => {
  const { handleSelectImage } = usePhraseAndImageContext();
  return (
    <Button
      {...props}
      className={css.card}
      id={`image_${id}`}
      data-join={join}
      onClick={() => handleSelectImage(url, join, alt)}>
      <Image size="100%" addClass={css.imageQuestion} noCaption src={url} alt={alt} />
      {/* <img src="assets/images/prueba.jpg" alt={item} /> */}
    </Button>
  );
};
