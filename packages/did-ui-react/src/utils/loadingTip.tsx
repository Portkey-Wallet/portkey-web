import CircleLoading from '../components/CircleLoading';
import singleMessage from '../components/CustomAnt/message';

export interface ILoadingTipParams {
  msg: string;
}

export const loadingTip = (arg: ILoadingTipParams) => {
  singleMessage.open({
    content: (
      <div className="portkey-ui-flex-row-center">
        <CircleLoading loading className="portkey-ui-warning-loading" />
        {arg.msg}
      </div>
    ),
  });
};
