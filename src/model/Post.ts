
export default class PostClass {
    title: string = '';
    date: string = '2022-03-29';
    slug: string = '';
    fileName: string = '';
    extension: string = '';
    url: string | undefined;
    more: boolean = false;
    tags: string[] | undefined;
    description: string | undefined;
}