interface Props {
  title?: string;
  message: string;
}

export function AccessDenied({
  title = 'Access restricted',
  message,
}: Props) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  );
}
