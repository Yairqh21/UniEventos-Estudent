interface PathRequest {
  pathSegments: string[];
}


export interface DataRequest<T> {
  path: PathRequest;
  entity: T;
}
