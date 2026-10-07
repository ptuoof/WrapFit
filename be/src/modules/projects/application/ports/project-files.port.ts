export const PROJECT_FILES = Symbol('PROJECT_FILES');

/** Same values as the Prisma enum FilePurpose (uploads only). */
export type UploadPurpose = 'LOGO' | 'IMAGE' | 'THUMBNAIL' | 'AVATAR';

export interface ProjectFile {
  projectId: string;
  key: string;
}

/** Files of projects in object storage (implemented by StorageService). */
export interface IProjectFiles {
  /**
   * Detaches from these projects the uploaded files that other projects still show: a duplicate or a remix copies
   * the canvas with its image URLs, so those files must outlive the deleted source. Call before listProjectFiles.
   */
  detachSharedFiles(projectIds: string[]): Promise<void>;
  /** Read before deleting the projects: the file rows disappear with them (ON DELETE CASCADE). */
  listProjectFiles(projectIds: string[]): Promise<ProjectFile[]>;
  /** Removes objects from the bucket. Never throws. */
  deleteObjects(keys: string[]): Promise<void>;
  /** Key of an upload URL of `userId` for one of `purposes`; 400 FILE_URL_NOT_ALLOWED / FILE_NOT_OWNED otherwise. */
  resolveUpload(url: string, userId: string, purposes: UploadPurpose[]): Promise<string>;
  /** 400 FILE_NOT_OWNED when a canvas adds an upload of someone else (`alreadyShown` keys are allowed). */
  assertCanvasUploads(keys: string[], userId: string, alreadyShown: string[]): Promise<void>;
}
