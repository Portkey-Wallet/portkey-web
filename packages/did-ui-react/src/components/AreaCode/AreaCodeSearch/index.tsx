import { Input } from 'antd';
import React from 'react';
import CustomSvg from '../../CustomSvg';
import './index.less';

export default function AreaCodeSearch({ onChange }: { onChange?: React.ChangeEventHandler<HTMLInputElement> }) {
  return (
    <div className="area-code-search-input-wrapper">
      <Input
        className="clear-input-border search-input"
        prefix={<CustomSvg type="SearchBlur" className="search-svg" />}
        placeholder="Search countries and regions"
        onChange={onChange}
      />
    </div>
  );
}
