import { Audio } from 'books-ui';
import { Modal } from '@ui/components/modal';
import type { ModalCoreProps } from '@ui/components/modal/modal';

import { useOvaContext } from '@/context/ova-context';

import { loadCSS } from '../../utils/loadCSS';

import { i18n } from './consts';

const css = await loadCSS({
  ui: 'modal-credits/modal-credits.module.css',
  local: 'modal-credits/modal-credits.module.css'
});
interface Props extends ModalCoreProps {
  addClass?: string;
  school: string;
  course?: string;
  teachers: string[];
  audio?: string;
  lang?: 'es';
  currentYear?: boolean;
}

export const ModalCredits: React.FC<Props> = ({
  addClass,
  school,
  teachers,
  audio,
  course,
  currentYear = false,
  lang: langProp,
  ...props
}) => {
  const { lang } = useOvaContext();

  return (
    <Modal {...props} addClass={`${css['modal']} u-py-4 ${addClass ?? ''}`}>
      <div className={`${css['modal-credits__wrapper']} u-flow u-text-center`}>
        <h2>{i18n[lang].title}</h2>
        <p>Vicerrectoría de Medios y Mediaciones Pedagógicas - VIMEP</p>
        <p>Red de Gestión Tecnopedagógica de Cursos y Recursos Educativos Digitales</p>
        <p>{school}</p>
        {course && <p>{course}</p>}
        {teachers.map((teacher, index) => (
          <Teacher key={`${index}-teacher`} teacher={teacher} />
        ))}
        {currentYear ? <p>2025</p> : <p>2024</p>}
        <p>UNAD</p>
        <p className="u-font-bold u-font-italic">“{i18n[langProp || lang].license}”</p>
        {audio ? <Audio src={audio} /> : null}
      </div>
    </Modal>
  );
};

const Teacher = ({ teacher }: { teacher: string }) => (
  <p>
    <strong>{teacher}</strong>
  </p>
);
