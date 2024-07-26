import axios from "axios";
import DOMPurify from "dompurify";

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `;
  }).join('');
};

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');
  
  searchInput.on('input', function(){
    // if there is no value, quit it
    if(!this.value) {
      searchResults.style.display = 'none';
      return; //stop
    }

    // show the search results!
    searchResults.style.display = 'block';
    searchResults.innerHTML = '';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if(res.data.length) {
          searchResults.innerHTML = DOMPurify.sanitize(searchResultsHTML(res.data));
          return;
        }
        // tell them nothing came back
        searchResults.innerHTML = DOMPurify.sanitize(`
          <div class="search__result">No results for ${this.value} found!</div>
        `);
      })
      .catch(err => {
        console.error(err);
      });
  });

  // Handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // if they aren't pressing up, down, or, enter, who cares
    if(![38, 40, 13].includes(e.keyCode)){
      return; // Skip it
    }
    const activeClass = 'search__result--active';
    const current =  search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    if (e.keyCode === 40 && current){ // If the key is arrow down and there IS something currently highlighted
      next = current.nextElementSibling || items[0]; // highlight the next item or the first item if we're at the bottom
    } else if (e.keyCode === 40) { // If the key is down and nothing is highlighted
      next = items[0]; // highlight the first item
    } else if (e.keyCode === 38 && current) { // if the key is up and there IS something highlighted
      next = current.previousElementSibling || items[items.length - 1]; // highlight the previous item or the last item if we're at the top
    } else if (e.keyCode === 38) { // If the key is up and nothing is highlighted
      next = items[items.length - 1] // highlight the last item
    } else if (e.keyCode === 13 && current.href){ // if the key is enter
      window.location = current.href; // got to the href of the currently selected element
      return;
    }

    if (current) { // if there is a currently highlighted thing (AKA it has the active class)...
      current.classList.remove(activeClass);// ...remove that highlighting so that we can add it to what needs to be highlighted after the key press
    }
    next.classList.add(activeClass); // based on the results of the if statement, highlight what needs to be focused by adding the CSS class
  });
};

export default typeAhead;