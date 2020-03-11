export const createSignedFilestackURL = (policy, url) => {
    return `${url}?policy=${policy.policy}` + `&signature=${policy.signature}`;
  };
  
export const getExtensionFromMimetype = (mimetype) => {
    console.log('getExtensionFromMimetype, ', mimetype)
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
    return url.split('.').pop()
}