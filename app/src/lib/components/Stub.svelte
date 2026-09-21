<script lang="ts">
	type Props = { note: string };
	let { note }: Props = $props();
</script>

<div class="stub">
	<p>{note}</p>
</div>

<style>
	.stub {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: 0 40px;
	}

	p {
		margin: 0;
		max-width: 22ch;
		text-align: center;
		font-size: 14px;
		line-height: 1.5;
		color: var(--text-muted);
	}
</style>
