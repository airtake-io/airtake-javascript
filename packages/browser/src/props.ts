export const populateProps = () => {
  return {
    $library: 'browser',
    $current_url: location.href,
    $referrer: document.referrer,
    $screen_width: screen.width,
    $screen_height: screen.height,
    $occurred_at: Date.now(),
  };
};
