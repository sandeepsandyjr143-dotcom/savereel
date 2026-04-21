import { useReducer, useRef, useCallback } from 'react';
import { fetchVideoInfo, buildDownloadUrl, checkDownloadUrl } from '../services/api.js';
import { triggerDownload, readClipboard } from '../services/downloader.js';
import { detectPlatform } from '../utils/detectPlatform.js';

const INITIAL_STATE = {
  url:         '',
  platform:    null,
  loading:     false,
  result:      null,
  selectedFmt: null,
  downloading: false,
  error:       '',
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_URL':
      return { ...state, url: action.payload, platform: detectPlatform(action.payload), error: '', result: null, selectedFmt: null };
    case 'FETCH_START':
      return { ...state, loading: true, error: '', result: null, selectedFmt: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, result: action.payload, selectedFmt: action.payload.formats[0] || null };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_FORMAT':
      return { ...state, selectedFmt: action.payload };
    case 'DOWNLOAD_START':
      return { ...state, downloading: true, error: '' };
    case 'DOWNLOAD_DONE':
      return { ...state, downloading: false };
    case 'DOWNLOAD_ERROR':
      return { ...state, downloading: false, error: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return INITIAL_STATE;
    default:
      return state;
  }
}

export function useDownloader(showToast) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const inputRef          = useRef(null);
  const resultRef         = useRef(null);

  const handleFetch = useCallback(async () => {
    const trimmed = state.url.trim();
    if (!trimmed) {
      dispatch({ type: 'SET_ERROR', payload: 'Please paste a YouTube or Instagram URL.' });
      inputRef.current?.focus();
      return;
    }
    const platform = detectPlatform(trimmed);
    if (!platform) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a valid YouTube or Instagram URL.' });
      return;
    }
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await fetchVideoInfo(trimmed, platform);
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
    }
  }, [state.url]);

  const handleDownload = useCallback(async () => {
    const { result, selectedFmt, downloading, url } = state;
    if (!result || !selectedFmt || downloading) return;

    dispatch({ type: 'DOWNLOAD_START' });

    const dlUrl = buildDownloadUrl(result, selectedFmt, url);

    // Verify the download URL is reachable before triggering
    try {
      await checkDownloadUrl(dlUrl);
    } catch (err) {
      dispatch({ type: 'DOWNLOAD_ERROR', payload: err.message });
      showToast(err.message, 'error');
      return;
    }

    triggerDownload(dlUrl);
    showToast('Download started! Check your downloads folder.', 'success');
    dispatch({ type: 'DOWNLOAD_DONE' });
  }, [state, showToast]);

  const handlePaste = useCallback(async () => {
    const text = await readClipboard();
    if (text) dispatch({ type: 'SET_URL', payload: text });
    else inputRef.current?.focus();
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const setUrl    = useCallback((value) => dispatch({ type: 'SET_URL',    payload: value }), []);
  const setFormat = useCallback((fmt)   => dispatch({ type: 'SET_FORMAT', payload: fmt }),   []);

  return { state, inputRef, resultRef, handleFetch, handleDownload, handlePaste, reset, setUrl, setFormat };
}
