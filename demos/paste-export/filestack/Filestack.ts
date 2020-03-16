const knownExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'svg',
    'mp4',
    'mov',
];

export const createSignedFilestackURL = (policy, url) => {
        return `${url}?policy=${policy.policy}` + `&signature=${policy.signature}`;
  };
  
export const getExtensionFromMimetype = (mimetype) => {
    switch (mimetype) {
        case 'image/jpeg':
            return 'jpg';
        case 'image/png':
            return 'png';
        case 'video/mp4':
            return 'mp4';
    }
}

export const getExtensionFromURL = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    return knownExtensions.includes(extension)
        ? extension
        : 'unknown';
}