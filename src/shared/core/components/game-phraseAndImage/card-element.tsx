import { Button, Image } from 'books-ui';

import { usePhraseAndImageContext } from './game-phrase-context';

import css from './phrase-and-image.module.css';

type card = {
  id: number;
  join: number;
  phrase: string;
  img: string;
  state: boolean | null;
  alt: string;
};
export const CardElement: React.FC<card> = ({ id, join, phrase, state, img, alt, ...props }) => {
  const { handleOpenModal, validation, button } = usePhraseAndImageContext();
  return (
    <Button
      disabled={button}
      {...props}
      className={css.card}
      id={`card_${id}`}
      data-join={join}
      onClick={() => handleOpenModal(id, join)}>
      <Image size="100%" addClass={css.imageQuestion} noCaption src={img} alt={alt} />
      {/* <img src="assets/images/prueba.jpg" alt={item} /> */}
      <p data-value={validation ? state : null} className={css.textCard}>
        {phrase}
      </p>
    </Button>
  );
};
