for env in dev staging prod; do
  for dir in static postgres; do
    sudo mkdir -p /mnt/storage/fieldnotes/$env/$dir
  done
done
