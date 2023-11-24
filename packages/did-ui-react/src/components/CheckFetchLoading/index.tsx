import CircleLoading from '../CircleLoading';
import './index.less';

export default function CheckFetchLoading({ list, emptyElement = <></> }: { list: any; emptyElement?: any }) {
  return typeof list === 'undefined' ? <CircleLoading className="portkey-ui-empty-loading" loading /> : emptyElement;
}
