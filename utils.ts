export function useExcerpt (file: any, options: any): any {
    const delimiter = /<!--\s*more\s*-->/i;
    
    // if enabled, get the excerpt defined after front-matter
    let idx = -1;
    const match = delimiter.exec(file.content);
    if (match) {
      idx = match.index;
    }
    if (idx !== -1) {
      file.excerpt = file.content.slice(0, idx);
    } else if (file.data.description) {
      file.excerpt = file.data.description;
    }

    return file;
}
