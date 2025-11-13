export default function ChannelHeader({ name, description }: { name: string; description?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-lg font-semibold">#{name}</div>
        {description ? <div className="text-sm text-gsv-gray">{description}</div> : null}
      </div>
      <div className="text-sm text-gsv-gray">Channel Settings</div>
    </div>
  );
}


