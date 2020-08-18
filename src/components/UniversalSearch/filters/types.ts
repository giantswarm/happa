export interface IGenericFilterRendererProps<T = unknown> {
  type: string;
  searchTerm: string;
  result: T;
}
