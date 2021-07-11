<template>
    <div>
    {{propValue}}
    </div>
</template>

<script>
export default {
    props: {
        propValue: {
            type: String,
            default: '',
        },
    },
}
</script>