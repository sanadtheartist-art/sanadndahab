import React, { useState } from 'react';

// ResponsiveImage: generates srcset for Google-hosted images and provides a graceful fade-in
// Props: src, alt, className, breakpoints (array of widths), sizes (string), lazy (bool)
const ResponsiveImage = ({ src, alt = '', className = '', breakpoints = [360, 640, 900, 1200, 1600], sizes = '100vw', lazy = true, ...rest }) => {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return <div className={`w-full h-full bg-white/5 ${className}`} />;
  }

  const isGoogle = /googleusercontent\.com|ggpht\.com/i.test(src);

  const makeSrcForWidth = (w) => {
    let u = src.trim();
    if (u.startsWith('data:')) return u;
    if (isGoogle) {
      // remove existing size params and append =s{w}
      u = u.replace(/=s\d+[^&]*/gi, '').replace(/=w\d+[^&]*/gi, '');
      return u + `=s${w}`;
    }
    // For other hosts we just return the original; srcset won't be provided
    return u;
  };

  const srcSet = isGoogle ? breakpoints.map(w => `${makeSrcForWidth(w)} ${w}w`).join(', ') : undefined;
  const primary = makeSrcForWidth(Math.max(...breakpoints));

  return (
    <img
      src={primary}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={`${className} img-fade ${loaded ? 'loaded' : ''}`.trim()}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      {...rest}
    />
  );
};

export default ResponsiveImage;
