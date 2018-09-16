$('button').on('click', evt => {
    evt.preventDefault()
    let pkt = {}
    pkt.dataId = $(evt.target).attr("data-id")
    pkt.user = prompt("Please enter your name")
    pkt.comment = prompt("Please enter your comment")
    $.ajax({
        method: "POST",
        url: "/comment",
        data: pkt
    }).then( () => {
        location.reload()
    })
})