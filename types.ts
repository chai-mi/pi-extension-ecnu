export type ImagesResponse = {
  created: number;
  err_message: undefined;
  data: {
    b64_json: string;
    revised_prompt: string;
    size: string;
    requested_size: string;
  }[];
} | {
  created: number;
  err_message: string;
  data: {
    b64_json: undefined;
    revised_prompt: string;
    size: undefined;
    requested_size: string;
  }[];
};
