let ghToken = ''

async function doFetch(gql){
  const headers = {
    'Content-type': 'application/json',
    'Authorization': 'token ' + ghToken,
  }

  let req = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: headers,
    body:  JSON.stringify(gql)
  })

  let response = await req.json()
  return response.data
}

async function renderDetails(items, holder) {
  items.then(data => {
    for (i = 0, len = data.length; i < len; i++){
      holder.innerHTML += `
        <div class="pr">
          <span class="state ${data[i].node.state.toLowerCase()}">
            <i class="fas fa-code-branch"></i>
            ${data[i].node.state}
          </span>
          <a href="${data[i].node.url}">${data[i].node.title}</a>
        </div>
      `
    }
  })
}

async function renderContributionRow(data, holder, login) {
    let row = document.createElement('div')
        row.setAttribute('id', `row-${data.id}`)
        row.setAttribute('class', 'row')
        row.innerHTML += `
            <div class="head">
              <img class="pic" src="${data.openGraphImageUrl}" />
              <a href="${data.url}">${data.nameWithOwner}</a>
              <span class="stars">
                <i class="far fa-star"></i>${data.stargazers.totalCount}
              </span>
              <div class="short">${data.shortDescriptionHTML}</div>
            </div>
        `
    holder.appendChild(row)
    let detail = document.createElement('div')
        detail.setAttribute('class', `detail`)

    row.appendChild(detail)

    renderDetails(
      getContributionDetails(login, data.nameWithOwner),
      detail
    )
}

async function getContributions(login) {
  const gql = {query: `
  {
    user(login: "${login}") {
      repositoriesContributedTo(includeUserRepositories: false, first: 10, privacy: PUBLIC) {
        edges {
          node {
            id
            nameWithOwner
            shortDescriptionHTML(limit: 120)
            stargazers {
              totalCount
            }
            url
            openGraphImageUrl
          }
        }
      }
    }
  }
  `}

  contib = await doFetch(gql)

  return contib.user.repositoriesContributedTo.edges
}

async function getContributionDetails(login, repo) {
  const gql = {query:`
    {
      search(query: "author:${login} repo:${repo}", first: 10, type: ISSUE) {
        edges {
          node {
            ... on PullRequest {
              id
              title
              url
              state
            }
            ... on Issue {
              id
              title
              url
              state
            }
          }
        }
      }
    }
  `}

  detail = await doFetch(gql)

  return detail.search.edges
}

module.exports = {
  init: function (id, username, token) {
    (async() => {
      username = username.trim()
      ghToken = token
      let wrapper = document.getElementById(id);
          while (wrapper.firstChild) {
            wrapper.removeChild(wrapper.firstChild);
          }
          wrapper.setAttribute('class', 'gh-contrib-widget')

      let contib = await getContributions(username)

      if (contib.length > 0) {
        for(let i = 0, len = contib.length; i < len; i++) {
          renderContributionRow(contib[i].node, wrapper, username);
        }
      } else {
          wrapper.classList.add("empty");
          wrapper.innerHTML = `
            <p>Seems that <b>@<a href="https://github.com/${username}">${username}</a></b> have no contributions yet.</p>
            <i class="fab fa-github-alt"></i>
            <p>But it's never late to make some!</p>
          `
      }
      copy = document.createElement('a')
      copy.setAttribute('href', "http://alexandergor.com/gh-contrib-widget")
      copy.setAttribute('style', "width: inherit; position: absolute; font-size:10px; margin:2px -5px; color:lightgray; text-align:right;")
      copy.text = "widget by Alexander Gor"

      wrapper.appendChild(copy)
    })();
  }
};
