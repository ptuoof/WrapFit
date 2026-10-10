/**
 * Internal events (`@nestjs/event-emitter`). Listeners (`@OnEvent`) run asynchronously and must not
 * throw back into the request that emitted the event. The future NotificationsModule subscribes here.
 */
export const PROJECT_FORKED = 'project.forked';

export interface ProjectForkedEvent {
  /** The public project that was remixed. */
  sourceProjectId: string;
  /** Its author: the user to notify. */
  sourceOwnerId: string;
  /** The new project created in the remixer's workspace. */
  forkProjectId: string;
  forkedById: string;
}
