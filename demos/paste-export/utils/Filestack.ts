/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-useless-concat */
/* eslint-disable prefer-object-spread */

export interface Policy {
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly expiresAtClient: Date;
  readonly canCreate: boolean;
  readonly canRead: boolean;
  readonly canUpdate: boolean;
  readonly canDelete: boolean;
  readonly apiKey: string;
  readonly maxSize: number;
  readonly pathPrefix: string;
  readonly policy: string;
  readonly signature: string;
  readonly presentationUUID: string;
}

export const createSignedFilestackURL = (policy: Policy, url: string): string => {
  return `${url}?policy=${policy.policy}` + `&signature=${policy.signature}`;
};