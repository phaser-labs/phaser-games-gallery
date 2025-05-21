import { Icon } from '../icon';

import css from './button-download.module.css';

interface ButtonDownloadProps {
  addClass?: string;
  label: string;
  fileUrl: string;
  fileName?: string;
}

export const ButtonDownload: React.FC<ButtonDownloadProps> = ({ addClass, label, fileUrl, fileName }) => {
  return (
    <a href={fileUrl} download={fileName} target="_blank" rel="noopener noreferrer" className={`${css.downloadLink} ${addClass ?? ''}`}>
        {label}
        <Icon name="arrow-right-button" />
    </a>
  );
};