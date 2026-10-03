export const PROJECT_FILES = Symbol('PROJECT_FILES');

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
}
