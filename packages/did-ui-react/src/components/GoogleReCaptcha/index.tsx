/**
 * @remarks Google reCAPTCHA component.
 * Fork https://github.com/matei-radu/react-recaptcha-v2
 */
/*
 * Copyright (c) 2018-present, Matei Bogdan Radu <opensource@mateiradu.dev>
 *
 * This source code is licensed under the MIT license found in the LICENSE
 * file in the root directory of this source tree.
 */

import { FC, useEffect, useState } from 'react';
// It is safe to use the non-secure version because the ids are not used
// for anything concerning security.
import { nanoid } from 'nanoid/non-secure';
import { BaseReCaptcha } from '../types';

/** ID assigned to the main reCAPTCHA script. */
const MAIN_SCRIPT_ID = 'recaptcha';

/** Source of the main reCAPTCHA script. */
const MAIN_SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js';

/**
 * Pattern of the second, implicit reCAPTCHA script.
 *
 * Because this second script is versioned it is not possible to have a
 * simple, fixed string.
 */
const IMPLICIT_SCRIPT_SRC_PATTERN = /https:\/\/www.gstatic.com\/recaptcha\/releases\/.*.js$/;

/**
 * Test key for frontend applications.
 *
 * This key is the same for everyone, so it is safe to have here.
 */
const TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

/**
 * Returns the existing main reCAPTCHA `script` element if it exists.
 */
const getMainScriptElement = (): HTMLScriptElement | undefined => {
  if (document.getElementById(MAIN_SCRIPT_ID) !== null) {
    return document.getElementById(MAIN_SCRIPT_ID) as HTMLScriptElement;
  }

  // Maybe the script was added but not from this component.
  const availableScripts = Array.from(document.scripts);
  return availableScripts.find((script) => script.src === MAIN_SCRIPT_SRC);
};

/**
 * Creates a main reCAPTCHA `script` element.
 */
const createMainScriptElement = (): HTMLScriptElement => {
  const scriptElement = document.createElement('script');
  scriptElement.id = MAIN_SCRIPT_ID;
  scriptElement.src = MAIN_SCRIPT_SRC;
  scriptElement.async = true;
  scriptElement.defer = true;

  return scriptElement;
};

/**
 * Appends the reCAPTCHA script to the document body if necessary.
 */
const appendScript = (): void => {
  if (!getMainScriptElement()) {
    const reCaptchaScript = createMainScriptElement();
    document.body.appendChild(reCaptchaScript);
  }
};

/**
 * Removes the given `element` from its parent.
 */
const removeChildElement = (element: HTMLElement): void => {
  const parentNode = element.parentNode;
  if (parentNode !== null) {
    parentNode.removeChild(element);
  }
};

/**
 * Removes any reCAPTCHA script that was added implicitly.
 */
const removeImplicitRecaptchaScripts = (): void => {
  const allScripts = Array.from(document.scripts);
  const additionalScripts = allScripts.filter((script) => IMPLICIT_SCRIPT_SRC_PATTERN.test(script.src));
  additionalScripts.map(removeChildElement);
};

/**
 * Checks if a node is a reCAPTCHA hidden `div`.
 *
 * reCAPTCHA adds a hidden `div` to the document to function correctly.
 * However, this `div` does not have an ID or classes assigned, so this
 * function will check for some known style properties.
 *
 * Note that these known properties might change over time, so they might
 * need to be revised from time to time.
 */
const isNodeRecaptchaHiddenDiv = (node: Node): boolean => {
  const div = node as HTMLDivElement;
  return (
    div.style && div.style.visibility === 'hidden' && div.style.top === '-10000px' && div.style.position === 'absolute'
  );
};

/**
 * Returns a `MutationCallback` that calls the given `onHiddenDivFound`
 * callback when a reCAPTCHA hidden div is found.
 */
const mutationCallbackGenerator = (onHiddenDivFound: (hiddenDiv: HTMLDivElement) => void): MutationCallback => {
  return (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      if (
        // There was a DOM tree mutation...
        mutation.type === 'childList' &&
        // ...on the document body...
        mutation.target === document.body &&
        // ...where one node was added...
        mutation.addedNodes.length === 1 &&
        // ...and that node is a reCAPTCHA hidden div.
        isNodeRecaptchaHiddenDiv(mutation.addedNodes[0])
      ) {
        onHiddenDivFound(mutation.addedNodes[0] as HTMLDivElement);
      }
    });
  };
};

export interface ReCaptchaProps extends BaseReCaptcha {
  onSuccess?: (result: string) => any;
  onExpire?: (e?: any) => any;
  onError?: (e?: any) => any;
}

/**
 * React Hook for bind and unbinding reCAPTCHA callbacks to the `window`.
 */
const useWindowCallbackBinder = (callbacks: Pick<ReCaptchaProps, 'onSuccess' | 'onError' | 'onExpire'>) => {
  const [onSuccessCallbackId] = useState(nanoid());
  const [onErrorCallbackId] = useState(nanoid());
  const [onExpireCallbackId] = useState(nanoid());

  const { onSuccess, onError, onExpire } = callbacks;
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Feels hacky, but it's shorter than extending the Window interface.
    (window as any)[onSuccessCallbackId] = onSuccess;
    (window as any)[onExpireCallbackId] = onExpire;
    (window as any)[onErrorCallbackId] = onError;

    return () => {
      if (typeof window === 'undefined') return;
      delete (window as any)[onSuccessCallbackId];
      delete (window as any)[onExpireCallbackId];
      delete (window as any)[onErrorCallbackId];
    };
  }, [onSuccess, onSuccessCallbackId, onError, onErrorCallbackId, onExpire, onExpireCallbackId]);

  return {
    onSuccessCallbackId,
    onErrorCallbackId,
    onExpireCallbackId,
  };
};

/**
 * React hook for managing the reCAPTCHA scripts.
 */
const useRecaptchaScripts = () => {
  useEffect(() => {
    appendScript();

    return () => {
      const script = getMainScriptElement();
      if (script) {
        removeChildElement(script);
      }
      removeImplicitRecaptchaScripts();
    };
  }, []);
};

/**
 * React Hook for managing the reCAPTCHA hidden div that will eventually
 * be added to the DOM.
 */
const useRecaptchaHiddenDivManager = () => {
  useEffect(() => {
    let hiddenDiv: HTMLDivElement | null;
    const observer = new MutationObserver(
      mutationCallbackGenerator((div) => {
        hiddenDiv = div;
      }),
    );
    observer.observe(document.body, { childList: true });

    return () => {
      observer.disconnect();
      if (hiddenDiv) {
        removeChildElement(hiddenDiv);
      }
    };
  }, []);
};

const ReCaptcha: FC<ReCaptchaProps> = (props) => {
  const { siteKey, theme, size, ...callbacks } = props;
  const { onSuccessCallbackId, onErrorCallbackId, onExpireCallbackId } = useWindowCallbackBinder(callbacks);

  useRecaptchaHiddenDivManager();
  useRecaptchaScripts();
  const [id] = useState(nanoid());

  return typeof window !== 'undefined' ? (
    <div
      id={id}
      className="g-recaptcha"
      data-sitekey={siteKey === 'test' ? TEST_SITE_KEY : siteKey}
      data-theme={theme}
      data-size={size}
      data-callback={onSuccessCallbackId}
      data-error-callback={onErrorCallbackId}
      data-expired-callback={onExpireCallbackId}
    />
  ) : null;
};

export default ReCaptcha;
