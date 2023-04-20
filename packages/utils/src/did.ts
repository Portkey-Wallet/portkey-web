export function handleVerificationDoc(verificationDoc: string) {
  const [type, guardianIdentifier, verificationTime, verifierAddress, salt] = verificationDoc.split(',');
  return { type, guardianIdentifier, verificationTime, verifierAddress, salt };
}
