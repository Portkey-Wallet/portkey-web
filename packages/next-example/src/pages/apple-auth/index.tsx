import { useCallback } from 'react';
import qs from 'query-string';

export default function AppleAuth() {
  const handler = useCallback(() => {
    const { id_token } = qs.parse(location.search);
    const response = {
      access_token: id_token,
    };
    console.log(response, 'response===AppleAuth===');
  }, []);

  return <div></div>;
}
